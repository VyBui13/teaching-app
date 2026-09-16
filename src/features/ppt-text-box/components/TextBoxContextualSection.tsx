import React from 'react';
import { AnnotationEntity } from '../../annotation-canvas/domain/AnnotationEntity';
import type { BorderStyle } from '../types/textbox.types';
import { ColorSwatchPicker } from './ColorSwatchPicker';
import { CustomDropdownSelect, type DropdownOption } from './CustomDropdownSelect';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  Minus,
  Copy,
  Trash2,
  Sparkles,
  Maximize2,
  Type,
  Maximize,
} from 'lucide-react';

interface Props {
  annotation: AnnotationEntity;
  onUpdateAnnotation: (updated: AnnotationEntity) => void;
  onDuplicateAnnotation?: (id: string) => void;
  onDeleteAnnotation?: () => void;
}

const FONT_FAMILY_OPTIONS: DropdownOption<string>[] = [
  { label: 'Geist Sans', value: 'Geist Variable, sans-serif', previewStyle: { fontFamily: 'Geist Variable, sans-serif' } },
  { label: 'Arial', value: 'Arial, sans-serif', previewStyle: { fontFamily: 'Arial, sans-serif' } },
  { label: 'Roboto', value: 'Roboto, sans-serif', previewStyle: { fontFamily: 'Roboto, sans-serif' } },
  { label: 'Georgia', value: 'Georgia, serif', previewStyle: { fontFamily: 'Georgia, serif' } },
  { label: 'Courier New', value: 'Courier New, monospace', previewStyle: { fontFamily: 'Courier New, monospace' } },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive', previewStyle: { fontFamily: '"Comic Sans MS", cursive' } },
];

const FONT_SIZE_OPTIONS: DropdownOption<number>[] = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72].map((s) => ({
  label: `${s}px`,
  value: s,
}));

const BORDER_STYLE_OPTIONS: DropdownOption<BorderStyle>[] = [
  { label: 'Không viền', value: 'none' },
  { label: 'Nét liền ──', value: 'solid' },
  { label: 'Nét đứt - -', value: 'dashed' },
  { label: 'Chấm ・・', value: 'dotted' },
];

const BORDER_WIDTH_OPTIONS: DropdownOption<number>[] = [1, 2, 3, 4, 6, 8, 10].map((w) => ({
  label: `Dày ${w}px`,
  value: w,
}));

export const TextBoxContextualSection: React.FC<Props> = ({
  annotation,
  onUpdateAnnotation,
  onDuplicateAnnotation,
  onDeleteAnnotation,
}) => {
  const updateProps = (updates: Partial<ReturnType<AnnotationEntity['toJSON']>>) => {
    const updated = AnnotationEntity.create(
      {
        ...annotation.toJSON(),
        ...updates,
        updatedAt: Date.now(),
      },
      annotation.id
    );
    onUpdateAnnotation(updated);
  };

  const currentFontSize = annotation.fontSize || 20;
  const currentFontFamily = annotation.fontFamily || 'Geist Variable, sans-serif';
  const currentTextColor = annotation.color || '#0f172a';
  const currentBgColor = annotation.fillColor || 'transparent';
  const currentBorderColor = annotation.borderColor || 'transparent';
  const currentBorderStyle = annotation.borderStyle || 'none';
  const currentBorderWidth = annotation.borderWidth ?? 0;
  const currentTextAlign = annotation.textAlign || 'left';
  const currentFontWeight = annotation.fontWeight || 'normal';
  const currentFontStyle = annotation.fontStyle || 'normal';
  const currentTextDecoration = annotation.textDecoration || 'none';
  const currentBoxSizingMode = annotation.boxSizingMode || 'auto-fit';

  const handleFontSizeDelta = (delta: number) => {
    const newSize = Math.max(8, Math.min(144, currentFontSize + delta));
    updateProps({ fontSize: newSize });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Custom Styled Font Family Dropdown */}
      <CustomDropdownSelect
        value={currentFontFamily}
        options={FONT_FAMILY_OPTIONS}
        onChange={(val) => updateProps({ fontFamily: val })}
        icon={<Type className="h-3.5 w-3.5" />}
        title="Chọn Font chữ"
      />

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Font Size Stepper & Custom Dropdown */}
      <div className="flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => handleFontSizeDelta(-2)}
          className="flex h-7 w-6 items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-lg dark:text-slate-300 dark:hover:bg-slate-700"
          title="Giảm cỡ chữ"
        >
          <Minus className="h-3 w-3" />
        </button>

        <CustomDropdownSelect
          value={currentFontSize}
          options={FONT_SIZE_OPTIONS}
          onChange={(val) => updateProps({ fontSize: val })}
          title="Cỡ chữ"
        />

        <button
          type="button"
          onClick={() => handleFontSizeDelta(2)}
          className="flex h-7 w-6 items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-lg dark:text-slate-300 dark:hover:bg-slate-700"
          title="Tăng cỡ chữ"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Bold, Italic, Underline, Strikethrough */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() =>
            updateProps({ fontWeight: currentFontWeight === 'bold' ? 'normal' : 'bold' })
          }
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentFontWeight === 'bold'
              ? 'bg-blue-100 text-blue-600 font-bold dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="In đậm (Bold)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() =>
            updateProps({ fontStyle: currentFontStyle === 'italic' ? 'normal' : 'italic' })
          }
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentFontStyle === 'italic'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 font-bold'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="In nghiêng (Italic)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() =>
            updateProps({
              textDecoration: currentTextDecoration === 'underline' ? 'none' : 'underline',
            })
          }
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentTextDecoration === 'underline'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Gạch chân (Underline)"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() =>
            updateProps({
              textDecoration: currentTextDecoration === 'line-through' ? 'none' : 'line-through',
            })
          }
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentTextDecoration === 'line-through'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Gạch ngang chữ"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Alignments */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => updateProps({ textAlign: 'left' })}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentTextAlign === 'left'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Căn trái"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => updateProps({ textAlign: 'center' })}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentTextAlign === 'center'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Căn giữa"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => updateProps({ textAlign: 'right' })}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentTextAlign === 'right'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Căn phải"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => updateProps({ textAlign: 'justify' })}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
            currentTextAlign === 'justify'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Căn đều"
        >
          <AlignJustify className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Reusable Color Pickers: Text Color, Fill Background, Border */}
      <div className="flex items-center gap-1.5">
        {/* Text Color */}
        <ColorSwatchPicker
          label="Màu chữ"
          value={currentTextColor}
          onChange={(color) => updateProps({ color })}
          allowTransparent={false}
          type="text"
        />

        {/* Fill Background Color */}
        <ColorSwatchPicker
          label="Màu nền"
          value={currentBgColor}
          onChange={(color) => updateProps({ fillColor: color })}
          allowTransparent={true}
          type="bg"
        />

        {/* Border Color */}
        <ColorSwatchPicker
          label="Màu viền"
          value={currentBorderColor}
          onChange={(color) =>
            updateProps({
              borderColor: color,
              borderWidth: color === 'transparent' ? 0 : currentBorderWidth || 2,
              borderStyle:
                color === 'transparent' ? 'none' : currentBorderStyle === 'none' ? 'solid' : currentBorderStyle,
            })
          }
          allowTransparent={true}
          type="border"
        />
      </div>

      {/* Border Style Dropdown */}
      <CustomDropdownSelect
        value={currentBorderStyle}
        options={BORDER_STYLE_OPTIONS}
        onChange={(styleVal) =>
          updateProps({
            borderStyle: styleVal,
            borderWidth: styleVal === 'none' ? 0 : Math.max(1, currentBorderWidth || 2),
          })
        }
        title="Kiểu đường viền"
      />

      {/* NEW: Border Width Dropdown (Độ dày viền) */}
      {currentBorderStyle !== 'none' && currentBorderColor !== 'transparent' && (
        <CustomDropdownSelect
          value={currentBorderWidth || 2}
          options={BORDER_WIDTH_OPTIONS}
          onChange={(wVal) => updateProps({ borderWidth: wVal })}
          title="Độ dày đường viền (px)"
          icon={<Maximize className="h-3.5 w-3.5" />}
        />
      )}

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Auto-fit vs Fixed Bounds mode */}
      <button
        type="button"
        onClick={() =>
          updateProps({
            boxSizingMode: currentBoxSizingMode === 'auto-fit' ? 'fixed-bounds' : 'auto-fit',
          })
        }
        className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-bold transition-colors ${
          currentBoxSizingMode === 'auto-fit'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
        }`}
        title={
          currentBoxSizingMode === 'auto-fit'
            ? 'Tự động mở rộng chiều cao theo nội dung'
            : 'Cố định kích thước khung'
        }
      >
        {currentBoxSizingMode === 'auto-fit' ? (
          <>
            <Sparkles className="h-3 w-3 text-emerald-600" />
            <span>Auto-fit</span>
          </>
        ) : (
          <>
            <Maximize2 className="h-3 w-3 text-indigo-600" />
            <span>Fixed Bounds</span>
          </>
        )}
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

      {/* Actions: Duplicate & Delete */}
      {onDuplicateAnnotation && (
        <button
          type="button"
          onClick={() => onDuplicateAnnotation(annotation.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Nhân bản (Ctrl+D)"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}

      {onDeleteAnnotation && (
        <button
          type="button"
          onClick={onDeleteAnnotation}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
          title="Xóa đối tượng"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
