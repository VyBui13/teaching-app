import React from 'react';
import type { PPTTextBox, TextBoxStyle, BoxSizingMode, BorderStyle } from '../types/textbox.types';
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
  Lock,
  Unlock,
  Layers,
  Sparkles,
  Maximize2,
} from 'lucide-react';

interface Props {
  box: PPTTextBox;
  onUpdateStyle: (id: string, styleUpdates: Partial<TextBoxStyle>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  position: { x: number; y: number };
}

const FONT_FAMILIES = [
  { label: 'Geist Sans', value: 'Geist Variable, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72];

export const PPTTextBoxToolbar: React.FC<Props> = ({
  box,
  onUpdateStyle,
  onDuplicate,
  onDelete,
  onToggleLock,
  onBringForward,
  onSendBackward,
  position,
}) => {
  const style = box.style;

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(8, Math.min(144, style.fontSize + delta));
    onUpdateStyle(box.id, { fontSize: newSize });
  };

  const toggleBold = () => {
    onUpdateStyle(box.id, {
      fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
    });
  };

  const toggleItalic = () => {
    onUpdateStyle(box.id, {
      fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic',
    });
  };

  const toggleUnderline = () => {
    onUpdateStyle(box.id, {
      textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline',
    });
  };

  const toggleStrikethrough = () => {
    onUpdateStyle(box.id, {
      textDecoration: style.textDecoration === 'line-through' ? 'none' : 'line-through',
    });
  };

  const toggleBoxSizingMode = () => {
    const nextMode: BoxSizingMode =
      style.boxSizingMode === 'auto-fit' ? 'fixed-bounds' : 'auto-fit';
    onUpdateStyle(box.id, { boxSizingMode: nextMode });
  };

  return (
    <div
      className="absolute z-[100] flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md transition-all duration-150 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100"
      style={{
        left: `${Math.max(16, position.x)}px`,
        top: `${Math.max(12, position.y)}px`,
        transform: 'translateY(-100%)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Font Family Selector */}
      <select
        value={style.fontFamily}
        onChange={(e) => onUpdateStyle(box.id, { fontFamily: e.target.value })}
        className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Font Size Selector */}
      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={() => handleFontSizeChange(-2)}
          className="flex h-8 w-7 items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg dark:text-slate-300 dark:hover:bg-slate-700"
          title="Decrease Font Size"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <select
          value={style.fontSize}
          onChange={(e) => onUpdateStyle(box.id, { fontSize: Number(e.target.value) })}
          className="h-8 bg-transparent text-center text-xs font-semibold text-slate-700 outline-none dark:text-slate-200"
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          onClick={() => handleFontSizeChange(2)}
          className="flex h-8 w-7 items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg dark:text-slate-300 dark:hover:bg-slate-700"
          title="Increase Font Size"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Text Style Toggles (Bold, Italic, Underline, Strikethrough) */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleBold}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            style.fontWeight === 'bold'
              ? 'bg-blue-100 text-blue-600 font-bold dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={toggleItalic}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            style.fontStyle === 'italic'
              ? 'bg-blue-100 text-blue-600 italic dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={toggleUnderline}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            style.textDecoration === 'underline'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          onClick={toggleStrikethrough}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            style.textDecoration === 'line-through'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Alignment Controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onUpdateStyle(box.id, { textAlign: 'left' })}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            style.textAlign === 'left'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onUpdateStyle(box.id, { textAlign: 'center' })}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            style.textAlign === 'center'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          onClick={() => onUpdateStyle(box.id, { textAlign: 'right' })}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            style.textAlign === 'right'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onUpdateStyle(box.id, { textAlign: 'justify' })}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            style.textAlign === 'justify'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Align Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Colors (Text Color, Background, Border) */}
      <div className="flex items-center gap-1.5">
        {/* Text Color */}
        <label className="relative cursor-pointer" title="Text Color">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            A
            <span
              className="absolute bottom-1 h-1 w-4 rounded-full"
              style={{ backgroundColor: style.textColor }}
            />
          </span>
          <input
            type="color"
            value={style.textColor}
            onChange={(e) => onUpdateStyle(box.id, { textColor: e.target.value })}
            className="invisible absolute inset-0 h-0 w-0"
          />
        </label>

        {/* Fill Background Color */}
        <label className="relative cursor-pointer" title="Shape Fill Color">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 shadow-inner dark:border-slate-700"
            style={{
              backgroundColor:
                style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor,
            }}
          >
            {style.backgroundColor === 'transparent' && (
              <span className="text-[10px] text-slate-400 font-bold">Ø</span>
            )}
          </span>
          <input
            type="color"
            value={
              style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor
            }
            onChange={(e) => onUpdateStyle(box.id, { backgroundColor: e.target.value })}
            className="invisible absolute inset-0 h-0 w-0"
          />
        </label>

        {/* Border Color */}
        <label className="relative cursor-pointer" title="Border Color">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md border-2 dark:border-slate-700"
            style={{
              borderColor:
                style.borderColor === 'transparent' ? '#cbd5e1' : style.borderColor,
            }}
          >
            {style.borderColor === 'transparent' && (
              <span className="text-[10px] text-slate-400 font-bold">Ø</span>
            )}
          </span>
          <input
            type="color"
            value={style.borderColor === 'transparent' ? '#3b82f6' : style.borderColor}
            onChange={(e) =>
              onUpdateStyle(box.id, {
                borderColor: e.target.value,
                borderWidth: style.borderWidth || 2,
                borderStyle: style.borderStyle === 'none' ? 'solid' : style.borderStyle,
              })
            }
            className="invisible absolute inset-0 h-0 w-0"
          />
        </label>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Border Style Selector */}
      <select
        value={style.borderStyle}
        onChange={(e) =>
          onUpdateStyle(box.id, {
            borderStyle: e.target.value as BorderStyle,
            borderWidth: e.target.value === 'none' ? 0 : Math.max(1, style.borderWidth),
          })
        }
        className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-1.5 text-xs text-slate-700 outline-none hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        title="Border Style"
      >
        <option value="none">No Border</option>
        <option value="solid">Solid Border</option>
        <option value="dashed">Dashed Border</option>
        <option value="dotted">Dotted Border</option>
      </select>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Box Sizing Mode Toggle (Auto-Fit vs Fixed Bounds) */}
      <button
        onClick={toggleBoxSizingMode}
        className={`flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition-colors ${
          style.boxSizingMode === 'auto-fit'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
        }`}
        title={
          style.boxSizingMode === 'auto-fit'
            ? 'Auto-Fit Shape to Text (Height adjusts automatically)'
            : 'Fixed Bounds (Shape height fixed)'
        }
      >
        {style.boxSizingMode === 'auto-fit' ? (
          <>
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Auto-fit</span>
          </>
        ) : (
          <>
            <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Fixed Bounds</span>
          </>
        )}
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Layer Z-Index Controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onBringForward(box.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Bring Forward"
        >
          <Layers className="h-4 w-4" />
        </button>
        <button
          onClick={() => onSendBackward(box.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Send Backward"
        >
          <Layers className="h-4 w-4 rotate-180" />
        </button>
      </div>

      {/* Lock / Unlock */}
      <button
        onClick={() => onToggleLock(box.id)}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          box.isLocked
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        }`}
        title={box.isLocked ? 'Unlock Shape' : 'Lock Shape'}
      >
        {box.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </button>

      {/* Duplicate */}
      <button
        onClick={() => onDuplicate(box.id)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        title="Duplicate Shape (Ctrl+D)"
      >
        <Copy className="h-4 w-4" />
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(box.id)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
        title="Delete Shape (Delete)"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
