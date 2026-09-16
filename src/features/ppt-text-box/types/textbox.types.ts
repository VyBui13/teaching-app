export type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export type BoxSizingMode = 'auto-fit' | 'fixed-bounds';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';

export interface TextBoxStyle {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: BorderStyle;
  borderRadius: number;
  padding: number;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  boxSizingMode: BoxSizingMode;
  lineHeight: number;
  opacity: number;
}

export interface PPTTextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  style: TextBoxStyle;
  zIndex: number;
  isLocked?: boolean;
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

export interface InteractionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  activeHandle: HandlePosition | null;
  startX: number;
  startY: number;
  initialBox: InteractionBounds;
  currentBox: InteractionBounds;
}
