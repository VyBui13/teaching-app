import { Entity } from '../../../core/domain/Entity';
import type { Point, ToolType } from '../../../types/annotation';

export interface AnnotationProps {
  pageIndex: number;
  type: ToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fillColor?: string;
  createdAt: number;
  updatedAt: number;
}

export class AnnotationEntity extends Entity<AnnotationProps> {
  static create(props: AnnotationProps, id?: string): AnnotationEntity {
    return new AnnotationEntity(props, id);
  }

  get pageIndex(): number {
    return this.props.pageIndex;
  }

  get type(): ToolType {
    return this.props.type;
  }

  get color(): string {
    return this.props.color;
  }

  get strokeWidth(): number {
    return this.props.strokeWidth;
  }

  get opacity(): number {
    return this.props.opacity;
  }

  get points(): Point[] | undefined {
    return this.props.points;
  }

  get x(): number | undefined {
    return this.props.x;
  }

  get y(): number | undefined {
    return this.props.y;
  }

  get width(): number | undefined {
    return this.props.width;
  }

  get height(): number | undefined {
    return this.props.height;
  }

  get text(): string | undefined {
    return this.props.text;
  }

  get fontSize(): number | undefined {
    return this.props.fontSize;
  }

  get fillColor(): string | undefined {
    return this.props.fillColor;
  }

  get createdAt(): number {
    return this.props.createdAt;
  }

  get updatedAt(): number {
    return this.props.updatedAt;
  }

  toJSON(): AnnotationProps & { id: string } {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
