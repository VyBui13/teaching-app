import React from 'react';
import { ColorSwatchPicker } from '../../ppt-text-box/components/ColorSwatchPicker';
import { CustomDropdownSelect, type DropdownOption } from '../../ppt-text-box/components/CustomDropdownSelect';
import { Shapes, Copy, Trash2, Maximize } from 'lucide-react';
import { AnnotationEntity } from '../domain/AnnotationEntity';
import type { BorderStyle } from '../../ppt-text-box/types/textbox.types';

export type ShapeType = 'rectangle' | 'circle' | 'arrow' | 'line';

interface Props {
  annotation?: AnnotationEntity | null;
  activeShapeType: ShapeType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  borderStyle: BorderStyle;
  onChangeShapeType: (type: ShapeType) => void;
  onChangeStrokeColor: (color: string) => void;
  onChangeFillColor: (color: string) => void;
  onChangeStrokeWidth: (width: number) => void;
  onChangeBorderStyle: (style: BorderStyle) => void;
  onDuplicateAnnotation?: (id: string) => void;
  onDeleteAnnotation?: () => void;
}

const SHAPE_TYPE_OPTIONS: DropdownOption<ShapeType>[] = [
  { label: 'Hình chữ nhật 🟩', value: 'rectangle' },
  { label: 'Hình tròn ⭕', value: 'circle' },
  { label: 'Mũi tên ↗️', value: 'arrow' },
  { label: 'Đường thẳng ➖', value: 'line' },
];

const BORDER_STYLE_OPTIONS: DropdownOption<BorderStyle>[] = [
  { label: 'Không viền (Ø)', value: 'none' },
  { label: 'Nét liền ──', value: 'solid' },
  { label: 'Nét đứt - -', value: 'dashed' },
  { label: 'Chấm ・・', value: 'dotted' },
];

const BORDER_WIDTH_OPTIONS: DropdownOption<number>[] = [1, 2, 3, 4, 6, 8, 10].map((w) => ({
  label: `Dày ${w}px`,
  value: w,
}));

export const ShapeContextualSection: React.FC<Props> = ({
  annotation,
  activeShapeType,
  strokeColor,
  fillColor,
  strokeWidth,
  borderStyle,
  onChangeShapeType,
  onChangeStrokeColor,
  onChangeFillColor,
  onChangeStrokeWidth,
  onChangeBorderStyle,
  onDuplicateAnnotation,
  onDeleteAnnotation,
}) => {
  const currentShapeType: ShapeType = annotation
    ? (['rectangle', 'circle', 'arrow', 'line'].includes(annotation.type)
        ? (annotation.type as ShapeType)
        : 'rectangle')
    : activeShapeType;

  const currentStrokeColor = annotation ? annotation.color : strokeColor;
  const currentFillColor = annotation ? annotation.fillColor || 'transparent' : fillColor;
  const currentStrokeWidth = annotation ? annotation.strokeWidth : strokeWidth;
  const currentBorderStyle = annotation ? annotation.borderStyle || 'solid' : borderStyle;

  const isLineOrArrow = currentShapeType === 'line' || currentShapeType === 'arrow';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Shape Type Selector Dropdown */}
      <CustomDropdownSelect
        value={currentShapeType}
        options={SHAPE_TYPE_OPTIONS}
        onChange={(val) => onChangeShapeType(val)}
        icon={<Shapes className="h-3.5 w-3.5" />}
        title="Chọn kiểu hình khối"
      />

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Fill Color Picker (Only for 2D closed shapes like rectangle & circle) */}
      {!isLineOrArrow && (
        <ColorSwatchPicker
          label="Màu tô"
          value={currentFillColor}
          onChange={onChangeFillColor}
          allowTransparent={true}
          type="bg"
        />
      )}

      {/* Border / Stroke Color Picker */}
      <ColorSwatchPicker
        label={isLineOrArrow ? 'Màu nét' : 'Màu viền'}
        value={currentStrokeColor}
        onChange={onChangeStrokeColor}
        allowTransparent={!isLineOrArrow}
        type="border"
      />

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Border Style Dropdown */}
      <CustomDropdownSelect
        value={currentBorderStyle}
        options={BORDER_STYLE_OPTIONS}
        onChange={(val) => onChangeBorderStyle(val)}
        title="Kiểu đường viền"
      />

      {/* Border Width Dropdown */}
      {currentBorderStyle !== 'none' && (
        <CustomDropdownSelect
          value={currentStrokeWidth}
          options={BORDER_WIDTH_OPTIONS}
          onChange={(val) => onChangeStrokeWidth(val)}
          title="Độ dày đường viền"
          icon={<Maximize className="h-3.5 w-3.5" />}
        />
      )}

      {/* Actions: Duplicate & Delete */}
      {annotation && (
        <>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
          {onDuplicateAnnotation && (
            <button
              type="button"
              onClick={() => onDuplicateAnnotation(annotation.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Nhân bản đối tượng (Ctrl+D)"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}

          {onDeleteAnnotation && (
            <button
              type="button"
              onClick={onDeleteAnnotation}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors"
              title="Xóa đối tượng"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
};
