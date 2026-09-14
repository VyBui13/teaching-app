import type { AnnotationEntity } from '../../../features/annotation-canvas/domain/AnnotationEntity';

export interface Point {
  x: number;
  y: number;
}

export function drawSmoothPath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  strokeWidth: number,
  opacity: number
) {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = opacity;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  // Draw last line segment
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  strokeWidth: number
) {
  const headlen = Math.max(10, strokeWidth * 3);
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  strokeColor: string,
  fillColor?: string,
  strokeWidth = 2
) {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  if (fillColor && fillColor !== 'transparent') {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
  }

  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  strokeColor: string,
  fillColor?: string,
  strokeWidth = 2
) {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  const radiusX = Math.abs(w) / 2;
  const radiusY = Math.abs(h) / 2;
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

  if (fillColor && fillColor !== 'transparent') {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  ctx.stroke();
  ctx.restore();
}

// Distance from point (px, py) to line segment (x1, y1) - (x2, y2)
function distToSegment(p: Point, v: Point, w: Point): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

// Eraser hit testing for annotations
export function isPointNearAnnotation(p: Point, ann: AnnotationEntity, eraserRadius = 15): boolean {
  if (ann.type === 'pencil' && ann.points) {
    for (let i = 0; i < ann.points.length - 1; i++) {
      const d = distToSegment(p, ann.points[i], ann.points[i + 1]);
      if (d <= eraserRadius + ann.strokeWidth / 2) return true;
    }
  } else if (ann.x !== undefined && ann.y !== undefined) {
    const minX = Math.min(ann.x, ann.x + (ann.width || 0)) - eraserRadius;
    const maxX = Math.max(ann.x, ann.x + (ann.width || 0)) + eraserRadius;
    const minY = Math.min(ann.y, ann.y + (ann.height || 0)) - eraserRadius;
    const maxY = Math.max(ann.y, ann.y + (ann.height || 0)) + eraserRadius;

    if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
      return true;
    }
  }
  return false;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function getAnnotationBounds(ann: AnnotationEntity): BoundingBox {
  if (ann.type === 'pencil' && ann.points && ann.points.length > 0) {
    let minX = ann.points[0].x;
    let maxX = ann.points[0].x;
    let minY = ann.points[0].y;
    let maxY = ann.points[0].y;
    ann.points.forEach((pt) => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });
    const padding = 6;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: Math.max(12, maxX - minX + padding * 2),
      height: Math.max(12, maxY - minY + padding * 2),
    };
  } else if (ann.x !== undefined && ann.y !== undefined) {
    const w = ann.width || 140;
    const linesCount = (ann.text || '').split('\n').length || 1;
    const h = ann.height || (ann.type === 'text' ? linesCount * (ann.fontSize || 18) * 1.3 + 12 : 40);
    const minX = Math.min(ann.x, ann.x + w);
    const maxX = Math.max(ann.x, ann.x + w);
    const minY = Math.min(ann.y, ann.y + h);
    const maxY = Math.max(ann.y, ann.y + h);
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(20, Math.abs(maxX - minX)),
      height: Math.max(20, Math.abs(maxY - minY)),
    };
  }
  return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
}

export function isPointInsideBounds(p: Point, bounds: BoundingBox, padding = 8): boolean {
  return (
    p.x >= bounds.minX - padding &&
    p.x <= bounds.maxX + padding &&
    p.y >= bounds.minY - padding &&
    p.y <= bounds.maxY + padding
  );
}

export function drawSelectionBox(ctx: CanvasRenderingContext2D, bounds: BoundingBox) {
  ctx.save();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(bounds.minX, bounds.minY, bounds.width, bounds.height);

  // Draw corner handles
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  const handleSize = 8;
  const corners = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.minX, y: bounds.maxY },
    { x: bounds.maxX, y: bounds.maxY },
  ];

  corners.forEach((c) => {
    ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
  });

  ctx.restore();
}

