import React from 'react';
import { ColorSwatchPicker } from '../../ppt-text-box/components/ColorSwatchPicker';
import { CustomDropdownSelect, type DropdownOption } from '../../ppt-text-box/components/CustomDropdownSelect';
import { Minus, Plus, Trash2, Edit3 } from 'lucide-react';
import { AnnotationEntity } from '../domain/AnnotationEntity';

interface Props {
  annotation?: AnnotationEntity | null;
  strokeColor: string;
  strokeWidth: number;
  onChangeStrokeColor: (color: string) => void;
  onChangeStrokeWidth: (width: number) => void;
  onDeleteAnnotation?: () => void;
}

const STROKE_WIDTH_OPTIONS: DropdownOption<number>[] = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24].map((w) => ({
  label: `Nét ${w}px`,
  value: w,
}));

export const PencilContextualSection: React.FC<Props> = ({
  annotation,
  strokeColor,
  strokeWidth,
  onChangeStrokeColor,
  onChangeStrokeWidth,
  onDeleteAnnotation,
}) => {
  const currentColor = annotation ? annotation.color : strokeColor;
  const currentWidth = annotation ? annotation.strokeWidth : strokeWidth;

  const handleWidthDelta = (delta: number) => {
    const newWidth = Math.max(1, Math.min(32, currentWidth + delta));
    onChangeStrokeWidth(newWidth);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Reusable Color Swatch Picker for Pencil Stroke */}
      <ColorSwatchPicker
        label="Màu nét vẽ"
        value={currentColor}
        onChange={onChangeStrokeColor}
        allowTransparent={false}
        type="border"
      />

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Stroke Width Stepper & Custom Dropdown Select */}
      <div className="flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => handleWidthDelta(-1)}
          className="flex h-7 w-6 items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-lg dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          title="Giảm độ dày nét vẽ"
        >
          <Minus className="h-3 w-3" />
        </button>

        <CustomDropdownSelect
          value={currentWidth}
          options={STROKE_WIDTH_OPTIONS}
          onChange={(val) => onChangeStrokeWidth(val)}
          title="Độ dày nét vẽ"
          icon={<Edit3 className="h-3.5 w-3.5" />}
        />

        <button
          type="button"
          onClick={() => handleWidthDelta(1)}
          className="flex h-7 w-6 items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-lg dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          title="Tăng độ dày nét vẽ"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Delete button when a pencil annotation is selected */}
      {annotation && onDeleteAnnotation && (
        <>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <button
            type="button"
            onClick={onDeleteAnnotation}
            className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors"
            title="Xóa nét vẽ này"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Xóa nét</span>
          </button>
        </>
      )}
    </div>
  );
};
