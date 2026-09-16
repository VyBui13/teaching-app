import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ToolSettings, ToolType } from '../../../types/annotation';
import { AnnotationEntity } from '../domain/AnnotationEntity';
import {
  type Point,
  type BoundingBox,
  type ResizeHandleType,
  getHitHandle,
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
  selectedAnnotation?: AnnotationEntity | null;
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
  selectedAnnotation: selectedAnnotationProp,
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

  // Resizing state for Canvas Shapes (8-Handle System)
  const [isResizingAnnotation, setIsResizingAnnotation] = useState(false);
  const [activeResizeHandle, setActiveResizeHandle] = useState<ResizeHandleType | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState<Point | null>(null);
  const [resizeOriginalAnn, setResizeOriginalAnn] = useState<AnnotationEntity | null>(null);
  const [resizeCurrentBounds, setResizeCurrentBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<ResizeHandleType | null>(null);

  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) || null;

  // Sync selected annotation from parent (WorkspacePage)
  useEffect(() => {
    if (selectedAnnotationProp === null) {
      setSelectedAnnotationId(null);
      setEditingTextIdState(null);
    } else if (selectedAnnotationProp) {
      if (selectedAnnotationProp.pageIndex === pageIndex) {
        setSelectedAnnotationId(selectedAnnotationProp.id);
      } else {
        setSelectedAnnotationId(null);
        setEditingTextIdState(null);
      }
    }
  }, [selectedAnnotationProp, pageIndex]);

  // Force clear selection when active tool changes to a creation tool
  useEffect(() => {
    if (toolSettings.activeTool !== 'select' && toolSettings.activeTool !== 'text') {
      setSelectedAnnotationId(null);
      setEditingTextIdState(null);
    }
  }, [toolSettings.activeTool]);

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
      const isSelectedResizing = ann.id === selectedAnnotationId && isResizingAnnotation && resizeCurrentBounds;
      const isSelectedDragging = ann.id === selectedAnnotationId && isDraggingAnnotation;

      const color = ann.color;
      const strokeWidth = ann.strokeWidth;
      const opacity = ann.opacity;

      if (ann.type === 'pencil') {
        if (ann.points && ann.points.length > 0) {
          const dx = isSelectedDragging ? dragDelta.x : 0;
          const dy = isSelectedDragging ? dragDelta.y : 0;
          const pointsToDraw = isSelectedDragging
            ? ann.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy }))
            : ann.points;
          drawSmoothPath(ctx, pointsToDraw, color, strokeWidth, opacity);
        }
      } else if (ann.x !== undefined && ann.y !== undefined) {
        const dx = isSelectedDragging ? dragDelta.x : 0;
        const dy = isSelectedDragging ? dragDelta.y : 0;

        const renderX = isSelectedResizing ? resizeCurrentBounds.x : ann.x + dx;
        const renderY = isSelectedResizing ? resizeCurrentBounds.y : ann.y + dy;
        const renderW = isSelectedResizing ? resizeCurrentBounds.width : (ann.width || 0);
        const renderH = isSelectedResizing ? resizeCurrentBounds.height : (ann.height || 0);

        if (ann.type === 'rectangle' || ann.type === 'shape') {
          drawRectangle(ctx, renderX, renderY, renderW, renderH, color, ann.fillColor, strokeWidth, ann.borderStyle);
        } else if (ann.type === 'circle') {
          drawCircle(ctx, renderX, renderY, renderW, renderH, color, ann.fillColor, strokeWidth, ann.borderStyle);
        } else if (ann.type === 'arrow') {
          drawArrow(ctx, renderX, renderY, renderX + renderW, renderY + renderH, color, strokeWidth, ann.borderStyle);
        } else if (ann.type === 'line') {
          if (color && color !== 'transparent' && ann.borderStyle !== 'none' && strokeWidth > 0) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            if (ann.borderStyle === 'dashed') ctx.setLineDash([8, 6]);
            else if (ann.borderStyle === 'dotted') ctx.setLineDash([3, 4]);
            else ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(renderX + renderW, renderY + renderH);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      ctx.restore();
    });

    // 2. Render 8-Handle Selection Bounding Box for canvas shapes (non-text)
    if (selectedAnnotation && selectedAnnotation.type !== 'text') {
      let currentBounds: BoundingBox;

      if (isResizingAnnotation && resizeCurrentBounds) {
        currentBounds = {
          minX: resizeCurrentBounds.x,
          minY: resizeCurrentBounds.y,
          maxX: resizeCurrentBounds.x + resizeCurrentBounds.width,
          maxY: resizeCurrentBounds.y + resizeCurrentBounds.height,
          width: resizeCurrentBounds.width,
          height: resizeCurrentBounds.height,
        };
      } else {
        const origBounds = getAnnotationBounds(selectedAnnotation);
        const dx = isDraggingAnnotation ? dragDelta.x : 0;
        const dy = isDraggingAnnotation ? dragDelta.y : 0;
        currentBounds = {
          ...origBounds,
          minX: origBounds.minX + dx,
          maxX: origBounds.maxX + dx,
          minY: origBounds.minY + dy,
          maxY: origBounds.maxY + dy,
        };
      }
      drawSelectionBox(ctx, currentBounds);
    }

    // 3. Render live drawing preview (Pencil, Rectangle, Circle, Arrow, Line, Shape)
    if (isDrawing && toolSettings.activeTool !== 'text') {
      ctx.save();
      const strokeColor = toolSettings.strokeColor;
      const strokeWidth = toolSettings.strokeWidth;
      const borderStyle = toolSettings.borderStyle;
      const effectiveShapeTool = toolSettings.activeTool === 'shape'
        ? (toolSettings.selectedShapeType || 'rectangle')
        : toolSettings.activeTool;

      if (toolSettings.activeTool === 'pencil' && currentPoints.length > 0) {
        drawSmoothPath(ctx, currentPoints, strokeColor, strokeWidth, 1);
      } else if (dragStart && dragCurrent) {
        const w = dragCurrent.x - dragStart.x;
        const h = dragCurrent.y - dragStart.y;

        if (effectiveShapeTool === 'rectangle') {
          drawRectangle(ctx, dragStart.x, dragStart.y, w, h, strokeColor, toolSettings.fillColor, strokeWidth, borderStyle);
        } else if (effectiveShapeTool === 'circle') {
          drawCircle(ctx, dragStart.x, dragStart.y, w, h, strokeColor, toolSettings.fillColor, strokeWidth, borderStyle);
        } else if (effectiveShapeTool === 'arrow') {
          drawArrow(ctx, dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, strokeColor, strokeWidth, borderStyle);
        } else if (effectiveShapeTool === 'line') {
          if (strokeColor && strokeColor !== 'transparent' && borderStyle !== 'none' && strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            if (borderStyle === 'dashed') ctx.setLineDash([8, 6]);
            else if (borderStyle === 'dotted') ctx.setLineDash([3, 4]);
            else ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(dragStart.x, dragStart.y);
            ctx.lineTo(dragCurrent.x, dragCurrent.y);
            ctx.stroke();
          }
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
    selectedAnnotationId,
    isDraggingAnnotation,
    isResizingAnnotation,
    resizeCurrentBounds,
    dragDelta,
    isDrawing,
    toolSettings,
    currentPoints,
    dragStart,
    dragCurrent,
    eraserPos,
  ]);

  useEffect(() => {
    redrawCanvas();
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
      // 1. Check if user clicked a handle on the currently selected shape
      if (selectedAnnotation && selectedAnnotation.type !== 'text') {
        const bounds = isResizingAnnotation && resizeCurrentBounds
          ? {
              minX: resizeCurrentBounds.x,
              minY: resizeCurrentBounds.y,
              maxX: resizeCurrentBounds.x + resizeCurrentBounds.width,
              maxY: resizeCurrentBounds.y + resizeCurrentBounds.height,
              width: resizeCurrentBounds.width,
              height: resizeCurrentBounds.height,
            }
          : getAnnotationBounds(selectedAnnotation);

        const hitHandle = getHitHandle(pos, bounds, 12);
        if (hitHandle) {
          setIsResizingAnnotation(true);
          setActiveResizeHandle(hitHandle);
          setResizeStartPos(pos);
          setResizeOriginalAnn(selectedAnnotation);
          setResizeCurrentBounds({
            x: selectedAnnotation.x || bounds.minX,
            y: selectedAnnotation.y || bounds.minY,
            width: selectedAnnotation.width || bounds.width,
            height: selectedAnnotation.height || bounds.height,
          });
          return;
        }
      }

      // 2. Find top-most annotation hit by cursor
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
        onSelectAnnotation?.(hitAnn);
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
      // 1. Handle active 8-handle shape resizing
      if (isResizingAnnotation && activeResizeHandle && resizeStartPos && resizeOriginalAnn) {
        const dx = pos.x - resizeStartPos.x;
        const dy = pos.y - resizeStartPos.y;

        const origX = resizeOriginalAnn.x ?? 0;
        const origY = resizeOriginalAnn.y ?? 0;
        const origW = resizeOriginalAnn.width ?? 100;
        const origH = resizeOriginalAnn.height ?? 100;

        let newX = origX;
        let newY = origY;
        let newW = origW;
        let newH = origH;

        if (activeResizeHandle.includes('e')) newW = Math.max(20, origW + dx);
        if (activeResizeHandle.includes('s')) newH = Math.max(20, origH + dy);

        if (activeResizeHandle.includes('w')) {
          const maxDx = origW - 20;
          const actualDx = Math.min(maxDx, dx);
          newX = origX + actualDx;
          newW = origW - actualDx;
        }

        if (activeResizeHandle.includes('n')) {
          const maxDy = origH - 20;
          const actualDy = Math.min(maxDy, dy);
          newY = origY + actualDy;
          newH = origH - actualDy;
        }

        setResizeCurrentBounds({ x: newX, y: newY, width: newW, height: newH });
        return;
      }

      // 2. Handle active shape dragging
      if (isDraggingAnnotation && dragStartPos && dragAnnOriginalState) {
        setDragDelta({
          x: pos.x - dragStartPos.x,
          y: pos.y - dragStartPos.y,
        });
        return;
      }

      // 3. Check for handle hovering to update cursor
      if (selectedAnnotation && selectedAnnotation.type !== 'text') {
        const bounds = getAnnotationBounds(selectedAnnotation);
        const handleHit = getHitHandle(pos, bounds, 12);
        setHoveredHandle(handleHit);
      } else {
        setHoveredHandle(null);
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
      // 1. Commit shape resize
      if (
        isResizingAnnotation &&
        resizeOriginalAnn &&
        resizeCurrentBounds &&
        onUpdateAnnotation
      ) {
        const updated = AnnotationEntity.create(
          {
            ...resizeOriginalAnn.toJSON(),
            x: resizeCurrentBounds.x,
            y: resizeCurrentBounds.y,
            width: resizeCurrentBounds.width,
            height: resizeCurrentBounds.height,
            updatedAt: Date.now(),
          },
          resizeOriginalAnn.id
        );
        onUpdateAnnotation(updated);
      }

      setIsResizingAnnotation(false);
      setActiveResizeHandle(null);
      setResizeStartPos(null);
      setResizeOriginalAnn(null);
      setResizeCurrentBounds(null);

      // 2. Commit shape drag
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
        fontFamily: toolSettings.fontFamily || 'Geist Variable, sans-serif',
        fillColor: toolSettings.fillColor || 'transparent',
        borderColor: toolSettings.borderColor || 'transparent',
        borderWidth: toolSettings.borderWidth ?? 0,
        borderStyle: toolSettings.borderStyle || 'none',
        textAlign: toolSettings.textAlign || 'left',
        fontWeight: toolSettings.fontWeight || 'normal',
        fontStyle: toolSettings.fontStyle || 'normal',
        textDecoration: toolSettings.textDecoration || 'none',
        boxSizingMode: toolSettings.boxSizingMode || 'auto-fit',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      onAddAnnotation(newAnn);
      setSelectedAnnotationId(newAnn.id);
      setEditingTextIdState(newAnn.id);
      onSelectAnnotation?.(newAnn);
    } else if (
      (tool === 'shape' || tool === 'rectangle' || tool === 'circle' || tool === 'arrow' || tool === 'line') &&
      dragStart &&
      dragCurrent
    ) {
      const w = dragCurrent.x - dragStart.x;
      const h = dragCurrent.y - dragStart.y;
      if (Math.abs(w) > 5 || Math.abs(h) > 5) {
        const effectiveType = tool === 'shape' ? (toolSettings.selectedShapeType || 'rectangle') : tool;
        const newAnn = AnnotationEntity.create({
          pageIndex,
          type: effectiveType,
          color: toolSettings.strokeColor,
          strokeWidth: toolSettings.strokeWidth,
          fillColor: toolSettings.fillColor,
          borderColor: toolSettings.borderColor || toolSettings.strokeColor,
          borderWidth: toolSettings.borderWidth || toolSettings.strokeWidth,
          borderStyle: toolSettings.borderStyle || 'solid',
          opacity: 1,
          x: dragStart.x,
          y: dragStart.y,
          width: w,
          height: h,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        onAddAnnotation(newAnn);
        setSelectedAnnotationId(newAnn.id);
        onSelectAnnotation?.(newAnn);
        onSwitchTool?.('select');
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
    onSelectAnnotation?.(clone);
  };

  const textAnnotations = annotations.filter((a) => a.type === 'text');
  const pptBoxes = textAnnotations.map(convertAnnotationToPPTBox);

  // Compute cursor style based on hover / resize / tool
  const getCanvasCursor = () => {
    if (toolSettings.activeTool === 'eraser') return 'cursor-none';
    if (toolSettings.activeTool === 'text') return 'cursor-text';
    if (toolSettings.activeTool !== 'select') return 'cursor-crosshair';

    if (hoveredHandle) {
      if (hoveredHandle === 'nw' || hoveredHandle === 'se') return 'cursor-nwse-resize';
      if (hoveredHandle === 'ne' || hoveredHandle === 'sw') return 'cursor-nesw-resize';
      if (hoveredHandle === 'n' || hoveredHandle === 's') return 'cursor-ns-resize';
      if (hoveredHandle === 'e' || hoveredHandle === 'w') return 'cursor-ew-resize';
    }

    if (hoveredAnnotationId || selectedAnnotationId) return 'cursor-move';
    return 'cursor-default';
  };

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
          setIsResizingAnnotation(false);
        }}
        className={`absolute inset-0 z-10 touch-none ${getCanvasCursor()}`}
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
