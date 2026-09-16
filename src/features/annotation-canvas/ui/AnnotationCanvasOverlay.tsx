import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ToolSettings, ToolType } from '../../../types/annotation';
import { AnnotationEntity } from '../domain/AnnotationEntity';
import {
  type Point,
  drawSmoothPath,
  drawArrow,
  drawRectangle,
  drawCircle,
  isPointNearAnnotation,
  getAnnotationBounds,
  isPointInsideBounds,
  drawSelectionBox,
} from '../../../core/shared/utils/canvasUtils';
import { PPTTextBoxComponent } from '../../ppt-text-box/components/PPTTextBoxComponent';
import type { PPTTextBox, TextBoxStyle } from '../../ppt-text-box/types/textbox.types';

interface Props {
  width: number;
  height: number;
  pageIndex: number;
  currentPageIndex?: number;
  annotations: AnnotationEntity[];
  toolSettings: ToolSettings;
  onAddAnnotation: (annotation: AnnotationEntity) => void;
  onUpdateAnnotation?: (annotation: AnnotationEntity) => void;
  onDeleteAnnotation?: (id: string) => void;
  onSelectAnnotation?: (annotation: AnnotationEntity | null) => void;
  editingTextId?: string | null;
  onDoneEditingText?: () => void;
  onSwitchTool?: (tool: ToolType) => void;
}

export const AnnotationCanvasOverlay: React.FC<Props> = ({
  width,
  height,
  pageIndex,
  currentPageIndex,
  annotations,
  toolSettings,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onSelectAnnotation,
  editingTextId,
  onDoneEditingText,
  onSwitchTool,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);
  const [eraserPos, setEraserPos] = useState<Point | null>(null);

  // Select & Drag-to-Move State for Canvas Non-Text Shapes
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [editingTextIdState, setEditingTextIdState] = useState<string | null>(null);
  const [isDraggingAnnotation, setIsDraggingAnnotation] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Point | null>(null);
  const [dragAnnOriginalState, setDragAnnOriginalState] = useState<AnnotationEntity | null>(null);
  const [dragDelta, setDragDelta] = useState<Point>({ x: 0, y: 0 });
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);

  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) || null;

  // Sync selected annotation up to parent ONLY if an annotation is actively selected on this slide page
  useEffect(() => {
    if (selectedAnnotationId !== null && selectedAnnotation) {
      onSelectAnnotation?.(selectedAnnotation);
    }
  }, [selectedAnnotation, selectedAnnotationId, onSelectAnnotation]);

  // Clear local selection state when user scrolls to a different slide page
  useEffect(() => {
    if (currentPageIndex !== undefined && currentPageIndex !== pageIndex && selectedAnnotationId) {
      setSelectedAnnotationId(null);
      setEditingTextIdState(null);
    }
  }, [currentPageIndex, pageIndex, selectedAnnotationId]);

  // Sync editingTextId prop from parent
  useEffect(() => {
    if (editingTextId) {
      setSelectedAnnotationId(editingTextId);
      setEditingTextIdState(editingTextId);
      onDoneEditingText?.();
    }
  }, [editingTextId, onDoneEditingText]);

  // Redraw non-text annotations on 2D canvas context
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Render canvas shapes (Pencil, Rectangle, Circle, Arrow, Line)
    annotations.forEach((ann) => {
      if (ann.type === 'text') return; // PPT Text shapes are rendered in DOM overlay

      ctx.save();
      const isSelected = ann.id === selectedAnnotationId && isDraggingAnnotation;
      const dx = isSelected ? dragDelta.x : 0;
      const dy = isSelected ? dragDelta.y : 0;

      const color = ann.color;
      const strokeWidth = ann.strokeWidth;
      const opacity = ann.opacity;

      if (ann.type === 'pencil') {
        if (ann.points && ann.points.length > 0) {
          const pointsToDraw = isSelected
            ? ann.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy }))
            : ann.points;
          drawSmoothPath(ctx, pointsToDraw, color, strokeWidth, opacity);
        }
      } else if (ann.type === 'rectangle' && ann.x !== undefined && ann.y !== undefined) {
        drawRectangle(ctx, ann.x + dx, ann.y + dy, ann.width || 0, ann.height || 0, color, ann.fillColor, strokeWidth);
      } else if (ann.type === 'circle' && ann.x !== undefined && ann.y !== undefined) {
        drawCircle(ctx, ann.x + dx, ann.y + dy, ann.width || 0, ann.height || 0, color, ann.fillColor, strokeWidth);
      } else if (ann.type === 'arrow' && ann.x !== undefined && ann.y !== undefined) {
        drawArrow(ctx, ann.x + dx, ann.y + dy, ann.x + (ann.width || 0) + dx, ann.y + (ann.height || 0) + dy, color, strokeWidth);
      } else if (ann.type === 'line' && ann.x !== undefined && ann.y !== undefined) {
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.moveTo(ann.x + dx, ann.y + dy);
        ctx.lineTo(ann.x + (ann.width || 0) + dx, ann.y + (ann.height || 0) + dy);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 2. Render Selection Bounding Box for canvas shapes (non-text)
    if (selectedAnnotation && selectedAnnotation.type !== 'text') {
      const origBounds = getAnnotationBounds(selectedAnnotation);
      const dx = isDraggingAnnotation ? dragDelta.x : 0;
      const dy = isDraggingAnnotation ? dragDelta.y : 0;
      const currentBounds = {
        ...origBounds,
        minX: origBounds.minX + dx,
        maxX: origBounds.maxX + dx,
        minY: origBounds.minY + dy,
        maxY: origBounds.maxY + dy,
      };
      drawSelectionBox(ctx, currentBounds);
    }

    // 3. Render live drawing preview (Pencil, Rectangle, Circle, Arrow, Line)
    if (isDrawing && toolSettings.activeTool !== 'text') {
      ctx.save();
      const strokeColor = toolSettings.strokeColor;
      const strokeWidth = toolSettings.strokeWidth;

      if (toolSettings.activeTool === 'pencil' && currentPoints.length > 0) {
        drawSmoothPath(ctx, currentPoints, strokeColor, strokeWidth, 1);
      } else if (dragStart && dragCurrent) {
        const w = dragCurrent.x - dragStart.x;
        const h = dragCurrent.y - dragStart.y;

        if (toolSettings.activeTool === 'rectangle') {
          drawRectangle(ctx, dragStart.x, dragStart.y, w, h, strokeColor, toolSettings.fillColor, strokeWidth);
        } else if (toolSettings.activeTool === 'circle') {
          drawCircle(ctx, dragStart.x, dragStart.y, w, h, strokeColor, toolSettings.fillColor, strokeWidth);
        } else if (toolSettings.activeTool === 'arrow') {
          drawArrow(ctx, dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, strokeColor, strokeWidth);
        } else if (toolSettings.activeTool === 'line') {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.beginPath();
          ctx.moveTo(dragStart.x, dragStart.y);
          ctx.lineTo(dragCurrent.x, dragCurrent.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 4. Render Eraser Circle Cursor
    if (toolSettings.activeTool === 'eraser' && eraserPos) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eraserPos.x, eraserPos.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }, [
    width,
    height,
    annotations,
    selectedAnnotation,
    isDraggingAnnotation,
    dragDelta,
    isDrawing,
    currentPoints,
    dragStart,
    dragCurrent,
    eraserPos,
    toolSettings,
  ]);

  useEffect(() => {
    let animId: number;
    animId = requestAnimationFrame(() => {
      redrawCanvas();
    });
    return () => cancelAnimationFrame(animId);
  }, [redrawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Perform eraser hit detection against page annotations
  const performEraserAction = (pos: Point) => {
    if (!onDeleteAnnotation) return;
    annotations.forEach((ann) => {
      if (isPointNearAnnotation(pos, ann, 16)) {
        onDeleteAnnotation(ann.id);
        if (selectedAnnotationId === ann.id) {
          setSelectedAnnotationId(null);
        }
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    const tool = toolSettings.activeTool;

    if (tool === 'select') {
      // Find top-most annotation hit by cursor
      let hitAnn: AnnotationEntity | null = null;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        if (ann.type === 'text') continue; // Handled by DOM PPTTextBoxComponent
        const bounds = getAnnotationBounds(ann);
        if (isPointInsideBounds(pos, bounds, 10) || isPointNearAnnotation(pos, ann, 12)) {
          hitAnn = ann;
          break;
        }
      }

      if (hitAnn) {
        setSelectedAnnotationId(hitAnn.id);
        setIsDraggingAnnotation(true);
        setDragStartPos(pos);
        setDragAnnOriginalState(hitAnn);
        setDragDelta({ x: 0, y: 0 });
      } else {
        setSelectedAnnotationId(null);
        setEditingTextIdState(null);
        onSelectAnnotation?.(null);
      }
      return;
    }

    if (tool === 'eraser') {
      setIsDrawing(true);
      performEraserAction(pos);
      return;
    }

    setIsDrawing(true);
    setDragStart(pos);
    setDragCurrent(pos);

    if (tool === 'pencil') {
      setCurrentPoints([pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    const tool = toolSettings.activeTool;

    if (tool === 'select') {
      if (isDraggingAnnotation && dragStartPos && dragAnnOriginalState) {
        setDragDelta({
          x: pos.x - dragStartPos.x,
          y: pos.y - dragStartPos.y,
        });
        return;
      }

      let foundHover: string | null = null;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        if (ann.type === 'text') continue;
        const bounds = getAnnotationBounds(ann);
        if (isPointInsideBounds(pos, bounds, 10) || isPointNearAnnotation(pos, ann, 12)) {
          foundHover = ann.id;
          break;
        }
      }
      setHoveredAnnotationId(foundHover);
      return;
    }

    if (tool === 'eraser') {
      setEraserPos(pos);
      if (isDrawing) {
        performEraserAction(pos);
      }
      return;
    }

    if (!isDrawing) return;

    setDragCurrent(pos);

    if (tool === 'pencil') {
      setCurrentPoints((prev) => [...prev, pos]);
    }
  };

  const handleMouseUp = () => {
    if (toolSettings.activeTool === 'select') {
      if (
        isDraggingAnnotation &&
        dragAnnOriginalState &&
        (dragDelta.x !== 0 || dragDelta.y !== 0) &&
        onUpdateAnnotation
      ) {
        if (dragAnnOriginalState.type === 'pencil' && dragAnnOriginalState.points) {
          const updatedPoints = dragAnnOriginalState.points.map((pt) => ({
            x: pt.x + dragDelta.x,
            y: pt.y + dragDelta.y,
          }));
          const updated = AnnotationEntity.create(
            {
              ...dragAnnOriginalState.toJSON(),
              points: updatedPoints,
              updatedAt: Date.now(),
            },
            dragAnnOriginalState.id
          );
          onUpdateAnnotation(updated);
        } else if (dragAnnOriginalState.x !== undefined && dragAnnOriginalState.y !== undefined) {
          const updated = AnnotationEntity.create(
            {
              ...dragAnnOriginalState.toJSON(),
              x: dragAnnOriginalState.x + dragDelta.x,
              y: dragAnnOriginalState.y + dragDelta.y,
              updatedAt: Date.now(),
            },
            dragAnnOriginalState.id
          );
          onUpdateAnnotation(updated);
        }
      }

      setIsDraggingAnnotation(false);
      setDragStartPos(null);
      setDragAnnOriginalState(null);
      setDragDelta({ x: 0, y: 0 });
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const tool = toolSettings.activeTool;

    if (tool === 'pencil' && currentPoints.length > 1) {
      const newAnn = AnnotationEntity.create({
        pageIndex,
        type: 'pencil',
        color: toolSettings.strokeColor,
        strokeWidth: toolSettings.strokeWidth,
        opacity: 1,
        points: currentPoints,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      onAddAnnotation(newAnn);
    } else if (tool === 'text' && dragStart && dragCurrent) {
      const w = Math.max(240, Math.abs(dragCurrent.x - dragStart.x));
      const h = Math.max(100, Math.abs(dragCurrent.y - dragStart.y));
      const minX = Math.min(dragStart.x, dragCurrent.x);
      const minY = Math.min(dragStart.y, dragCurrent.y);

      // Create PPT Text Box Annotation and start editing
      const newAnn = AnnotationEntity.create({
        pageIndex,
        type: 'text',
        color: toolSettings.strokeColor || '#0f172a',
        strokeWidth: toolSettings.strokeWidth,
        opacity: 1,
        x: minX,
        y: minY,
        width: w,
        height: h,
        text: '',
        fontSize: toolSettings.fontSize || 20,
        fontFamily: 'Geist Variable, sans-serif',
        borderColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'none',
        textAlign: 'left',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        boxSizingMode: 'auto-fit',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      onAddAnnotation(newAnn);
      setSelectedAnnotationId(newAnn.id);
      setEditingTextIdState(newAnn.id);
    } else if (
      (tool === 'rectangle' || tool === 'circle' || tool === 'arrow' || tool === 'line') &&
      dragStart &&
      dragCurrent
    ) {
      const w = dragCurrent.x - dragStart.x;
      const h = dragCurrent.y - dragStart.y;
      if (Math.abs(w) > 5 || Math.abs(h) > 5) {
        const newAnn = AnnotationEntity.create({
          pageIndex,
          type: tool,
          color: toolSettings.strokeColor,
          strokeWidth: toolSettings.strokeWidth,
          opacity: 1,
          x: dragStart.x,
          y: dragStart.y,
          width: w,
          height: h,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        onAddAnnotation(newAnn);
      }
    }

    setCurrentPoints([]);
    setDragStart(null);
    setDragCurrent(null);
  };

  // Convert AnnotationEntity to PPTTextBox props for rendering
  const convertAnnotationToPPTBox = (ann: AnnotationEntity): PPTTextBox => {
    return {
      id: ann.id,
      x: ann.x || 0,
      y: ann.y || 0,
      width: ann.width || 240,
      height: ann.height || 100,
      text: ann.text || '',
      zIndex: 20,
      style: {
        fontSize: ann.fontSize || 20,
        fontFamily: ann.fontFamily || 'Geist Variable, sans-serif',
        textColor: ann.color || '#0f172a',
        backgroundColor: ann.fillColor || 'transparent',
        borderColor: ann.borderColor || 'transparent',
        borderWidth: ann.borderWidth ?? 0,
        borderStyle: ann.borderStyle || 'none',
        borderRadius: 6,
        padding: 8,
        textAlign: ann.textAlign || 'left',
        verticalAlign: 'top',
        fontWeight: ann.fontWeight || 'normal',
        fontStyle: ann.fontStyle || 'normal',
        textDecoration: ann.textDecoration || 'none',
        boxSizingMode: ann.boxSizingMode || 'auto-fit',
        lineHeight: 1.35,
        opacity: ann.opacity ?? 1,
      },
    };
  };

  const handleUpdatePPTBox = (id: string, updates: Partial<PPTTextBox>) => {
    const existing = annotations.find((a) => a.id === id);
    if (!existing || !onUpdateAnnotation) return;

    const updated = AnnotationEntity.create(
      {
        ...existing.toJSON(),
        x: updates.x ?? existing.x,
        y: updates.y ?? existing.y,
        width: updates.width ?? existing.width,
        height: updates.height ?? existing.height,
        text: updates.text ?? existing.text,
        updatedAt: Date.now(),
      },
      existing.id
    );
    onUpdateAnnotation(updated);
  };

  const handleUpdatePPTStyle = (id: string, styleUpdates: Partial<TextBoxStyle>) => {
    const existing = annotations.find((a) => a.id === id);
    if (!existing || !onUpdateAnnotation) return;

    const updated = AnnotationEntity.create(
      {
        ...existing.toJSON(),
        color: styleUpdates.textColor ?? existing.color,
        fontSize: styleUpdates.fontSize ?? existing.fontSize,
        fontFamily: styleUpdates.fontFamily ?? existing.fontFamily,
        fillColor: styleUpdates.backgroundColor ?? existing.fillColor,
        borderColor: styleUpdates.borderColor ?? existing.borderColor,
        borderWidth: styleUpdates.borderWidth ?? existing.borderWidth,
        borderStyle: styleUpdates.borderStyle ?? existing.borderStyle,
        textAlign: styleUpdates.textAlign ?? existing.textAlign,
        fontWeight: styleUpdates.fontWeight ?? existing.fontWeight,
        fontStyle: styleUpdates.fontStyle ?? existing.fontStyle,
        textDecoration: styleUpdates.textDecoration ?? existing.textDecoration,
        boxSizingMode: styleUpdates.boxSizingMode ?? existing.boxSizingMode,
        updatedAt: Date.now(),
      },
      existing.id
    );
    onUpdateAnnotation(updated);
  };

  const handleDuplicatePPTBox = (id: string) => {
    const existing = annotations.find((a) => a.id === id);
    if (!existing) return;
    const json = existing.toJSON();
    const cloneProps = {
      ...json,
      x: (existing.x || 0) + 20,
      y: (existing.y || 0) + 20,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    delete (cloneProps as any).id;
    const clone = AnnotationEntity.create(cloneProps);
    onAddAnnotation(clone);
    setSelectedAnnotationId(clone.id);
  };

  const textAnnotations = annotations.filter((a) => a.type === 'text');
  const pptBoxes = textAnnotations.map(convertAnnotationToPPTBox);

  return (
    <div className="relative w-full h-full select-none" style={{ width, height }}>
      {/* 2D Canvas for Drawings & Non-text Annotations */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDrawing(false);
          setEraserPos(null);
          setIsDraggingAnnotation(false);
        }}
        className={`absolute inset-0 z-10 touch-none ${
          toolSettings.activeTool === 'eraser'
            ? 'cursor-none'
            : toolSettings.activeTool === 'select'
            ? hoveredAnnotationId || selectedAnnotationId
              ? 'cursor-move'
              : 'cursor-default'
            : toolSettings.activeTool === 'text'
            ? 'cursor-text'
            : 'cursor-crosshair'
        }`}
      />

      {/* RENDER ALL SLIDE TEXT ANNOTATIONS AS HIGH-PERFORMANCE PPT TEXT BOX SHAPES */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {textAnnotations.map((ann) => {
          const box = convertAnnotationToPPTBox(ann);
          const otherPPTBoxes = pptBoxes.filter((b) => b.id !== box.id);

          return (
            <div key={ann.id} className="pointer-events-auto">
              <PPTTextBoxComponent
                box={box}
                otherBoxes={otherPPTBoxes}
                canvasWidth={width}
                canvasHeight={height}
                isSelected={selectedAnnotationId === ann.id}
                isEditing={editingTextIdState === ann.id}
                onSelect={(id) => {
                  setSelectedAnnotationId(id);
                  onSelectAnnotation?.(ann);
                }}
                onStartEditing={(id) => {
                  setSelectedAnnotationId(id);
                  setEditingTextIdState(id);
                  onSelectAnnotation?.(ann);
                }}
                onDoneEditing={(id, text) => {
                  setEditingTextIdState(null);
                  setSelectedAnnotationId(id);
                  handleUpdatePPTBox(id, { text });
                  const targetAnn = annotations.find((a) => a.id === id);
                  if (targetAnn) {
                    onSelectAnnotation?.(targetAnn);
                  }
                  onSwitchTool?.('select');
                }}
                onUpdateBox={handleUpdatePPTBox}
                onUpdateStyle={handleUpdatePPTStyle}
                onDuplicate={handleDuplicatePPTBox}
                onDelete={(id) => {
                  onDeleteAnnotation?.(id);
                  if (selectedAnnotationId === id) setSelectedAnnotationId(null);
                }}
                onToggleLock={() => {}}
                onBringForward={() => {}}
                onSendBackward={() => {}}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
