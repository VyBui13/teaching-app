export type ToolType = 
  | 'select'
  | 'pencil'
  | 'eraser'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'line';

export interface Point {
  x: number;
  y: number;
}

export interface BaseAnnotation {
  id: string;
  pageIndex: number;
  type: ToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  createdAt: number;
  updatedAt: number;
}

export interface PathAnnotation extends BaseAnnotation {
  type: 'pencil';
  points: Point[];
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'rectangle' | 'circle' | 'arrow' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor?: string;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  width?: number;
  height?: number;
}

export type Annotation = PathAnnotation | ShapeAnnotation | TextAnnotation;

export interface ToolSettings {
  activeTool: ToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  opacity: number;
}
