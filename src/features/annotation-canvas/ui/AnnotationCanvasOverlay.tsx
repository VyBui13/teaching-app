import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ToolSettings } from '../../../types/annotation';
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

interface Props {
  width: number;
  height: number;
  pageIndex: number;
  annotations: AnnotationEntity[];
  toolSettings: ToolSettings;
  onAddAnnotation: (annotation: AnnotationEntity) => void;
  onUpdateAnnotation?: (annotation: AnnotationEntity) => void;
  onDeleteAnnotation?: (id: string) => void;
  onSelectAnnotation?: (annotation: AnnotationEntity | null) => void;
  editingTextId?: string | null;
  onDoneEditingText?: () => void;
}

export const AnnotationCanvasOverlay: React.FC<Props> = ({
  width,
  height,
  pageIndex,
  annotations,
  toolSettings,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onSelectAnnotation,
  editingTextId,
  onDoneEditingText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);
  const [eraserPos, setEraserPos] = useState<Point | null>(null);

  // Select & Drag-to-Move State
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [isDraggingAnnotation, setIsDraggingAnnotation] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Point | null>(null);
  const [dragAnnOriginalState, setDragAnnOriginalState] = useState<AnnotationEntity | null>(null);
  const [dragDelta, setDragDelta] = useState<Point>({ x: 0, y: 0 });
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);

  // PowerPoint-style text box editor state
  const [activeTextInput, setActiveTextInput] = useState<{
    editingId?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    color: string;
    fontSize: number;
  } | null>(null);

  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) || null;

  // Sync selected annotation up to parent (for top toolbar controls)
  useEffect(() => {
    onSelectAnnotation?.(selectedAnnotation);
  }, [selectedAnnotation, onSelectAnnotation]);

  // Trigger inline text editing when editingTextId is set from top toolbar
  useEffect(() => {
    if (editingTextId && selectedAnnotation && selectedAnnotation.id === editingTextId) {
      setActiveTextInput({
        editingId: selectedAnnotation.id,
        x: selectedAnnotation.x || 0,
        y: selectedAnnotation.y || 0,
        width: selectedAnnotation.width || 240,
        height: selectedAnnotation.height || 120,
        text: selectedAnnotation.text || '',
        color: selectedAnnotation.color,
        fontSize: selectedAnnotation.fontSize || 20,
      });
      onDoneEditingText?.();
    }
  }, [editingTextId, selectedAnnotation, onDoneEditingText]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Render all stored page annotations
    annotations.forEach((ann) => {
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
      } else if (ann.type === 'text' && ann.x !== undefined && ann.y !== undefined && ann.text) {
        if (!activeTextInput || activeTextInput.editingId !== ann.id) {
          ctx.fillStyle = color;
          ctx.font = `${ann.fontSize || 18}px sans-serif`;
          ctx.textBaseline = 'top';

          const lines = ann.text.split('\n');
          const lineHeight = (ann.fontSize || 18) * 1.3;
          lines.forEach((line, i) => {
            ctx.fillText(line, ann.x! + dx, ann.y! + dy + i * lineHeight);
          });
        }
      }
      ctx.restore();
    });

    // 2. Render Selection Bounding Box if an annotation is selected
    if (selectedAnnotation) {
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

    // 3. Render live preview of active drawing action
    if (isDrawing) {
      ctx.save();
      const strokeColor = toolSettings.strokeColor;
      const strokeWidth = toolSettings.strokeWidth;

      if (toolSettings.activeTool === 'pencil' && currentPoints.length > 0) {
        drawSmoothPath(ctx, currentPoints, strokeColor, strokeWidth, 1);
      } else if (dragStart && dragCurrent) {
        const w = dragCurrent.x - dragStart.x;
        const h = dragCurrent.y - dragStart.y;

        if (toolSettings.activeTool === 'rectangle' || toolSettings.activeTool === 'text') {
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
    activeTextInput,
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
      // Handle drag-to-move selected annotation
      if (isDraggingAnnotation && dragStartPos && dragAnnOriginalState) {
        setDragDelta({
          x: pos.x - dragStartPos.x,
          y: pos.y - dragStartPos.y,
        });
        return;
      }

      // Check hover for cursor highlight
      let foundHover: string | null = null;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
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
      const w = Math.max(200, Math.abs(dragCurrent.x - dragStart.x));
      const h = Math.max(100, Math.abs(dragCurrent.y - dragStart.y));
      const minX = Math.min(dragStart.x, dragCurrent.x);
      const minY = Math.min(dragStart.y, dragCurrent.y);

      // Open PowerPoint-style text box editor inside dragged frame
      setActiveTextInput({
        x: minX,
        y: minY,
        width: w,
        height: h,
        text: '',
        color: toolSettings.strokeColor,
        fontSize: toolSettings.fontSize || 20,
      });
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

  const handleCommitText = () => {
    if (!activeTextInput || !activeTextInput.text.trim()) {
      setActiveTextInput(null);
      return;
    }

    if (activeTextInput.editingId && onUpdateAnnotation) {
      const existing = annotations.find((a) => a.id === activeTextInput.editingId);
      if (existing) {
        const updated = AnnotationEntity.create(
          {
            ...existing.toJSON(),
            text: activeTextInput.text.trim(),
            color: activeTextInput.color,
            fontSize: activeTextInput.fontSize,
            updatedAt: Date.now(),
          },
          existing.id
        );
        onUpdateAnnotation(updated);
      }
    } else {
      const newAnn = AnnotationEntity.create({
        pageIndex,
        type: 'text',
        color: activeTextInput.color,
        strokeWidth: toolSettings.strokeWidth,
        opacity: 1,
        x: activeTextInput.x,
        y: activeTextInput.y,
        width: activeTextInput.width,
        height: activeTextInput.height,
        text: activeTextInput.text.trim(),
        fontSize: activeTextInput.fontSize,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      onAddAnnotation(newAnn);
    }

    setActiveTextInput(null);
  };

  return (
    <div className="relative w-full h-full select-none" style={{ width, height }}>
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

      {/* POWERPOINT-STYLE INLINE TEXT BOX EDITOR (DIRECT ON SLIDE, ZERO FLOATING TOOLBARS) */}
      {activeTextInput && (
        <div
          className="absolute z-40 flex flex-col pointer-events-auto"
          style={{
            left: activeTextInput.x,
            top: activeTextInput.y,
            width: Math.max(160, activeTextInput.width),
            minHeight: Math.max(40, activeTextInput.height),
          }}
        >
          <textarea
            autoFocus
            rows={2}
            value={activeTextInput.text}
            onChange={(e) => setActiveTextInput({ ...activeTextInput, text: e.target.value })}
            onBlur={() => {
              if (activeTextInput.text.trim()) {
                handleCommitText();
              } else {
                setActiveTextInput(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.ctrlKey || e.shiftKey) {
                  // Ctrl + Enter -> line break
                } else {
                  e.preventDefault();
                  handleCommitText();
                }
              } else if (e.key === 'Escape') {
                setActiveTextInput(null);
              }
            }}
            placeholder="Gõ chữ ở đây..."
            className="w-full bg-transparent border-2 border-dashed border-indigo-500/80 rounded-lg p-1.5 focus:outline-none focus:border-indigo-600 resize-both leading-tight font-sans shadow-sm"
            style={{
              color: activeTextInput.color,
              fontSize: `${activeTextInput.fontSize}px`,
            }}
          />
        </div>
      )}
    </div>
  );
};

