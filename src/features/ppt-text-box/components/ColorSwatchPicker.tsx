import React, { useState, useRef, useEffect } from 'react';
import { Palette, Ban, Check } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  onChange: (color: string) => void;
  allowTransparent?: boolean;
  type?: 'text' | 'bg' | 'border';
  presetColors?: string[];
}

const DEFAULT_PRESET_COLORS = [
  '#0f172a', // Dark Slate
  '#334155', // Slate
  '#64748b', // Cool Gray
  '#94a3b8', // Light Gray
  '#ffffff', // White
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#2563eb', // Primary Blue
  '#7c3aed', // Purple
  '#ec4899', // Pink
];

export const ColorSwatchPicker: React.FC<Props> = ({
  label,
  value,
  onChange,
  allowTransparent = false,
  type = 'text',
  presetColors = DEFAULT_PRESET_COLORS,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isTransparent = value === 'transparent' || !value;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectColor = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-7 items-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-all ${
          isOpen
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/60'
            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
        }`}
        title={label}
      >
        {/* Color Preview Swatch */}
        {type === 'text' ? (
          <span className="relative flex h-4 w-4 items-center justify-center font-bold text-slate-800 dark:text-slate-200">
            A
            <span
              className="absolute -bottom-0.5 h-1 w-3.5 rounded-full"
              style={{ backgroundColor: isTransparent ? '#94a3b8' : value }}
            />
          </span>
        ) : type === 'bg' ? (
          <span
            className="flex h-4 w-4 items-center justify-center rounded border border-slate-300 dark:border-slate-600 shadow-inner"
            style={{ backgroundColor: isTransparent ? 'transparent' : value }}
          >
            {isTransparent && <Ban className="h-3 w-3 text-red-500 stroke-[2.5]" />}
          </span>
        ) : (
          <span
            className="flex h-4 w-4 items-center justify-center rounded border-2 dark:border-slate-600"
            style={{ borderColor: isTransparent ? 'transparent' : value }}
          >
            {isTransparent && <Ban className="h-3 w-3 text-red-500 stroke-[2.5]" />}
          </span>
        )}

        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
      </button>

      {/* Color Picker Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Palette className="h-3.5 w-3.5 text-blue-500" />
              <span>{label}</span>
            </span>

            {/* Custom Color Input */}
            <label className="relative cursor-pointer flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline">
              <span>Tùy chỉnh</span>
              <input
                type="color"
                value={isTransparent ? '#3b82f6' : value}
                onChange={(e) => handleSelectColor(e.target.value)}
                className="h-5 w-5 cursor-pointer rounded border-none bg-transparent p-0"
              />
            </label>
          </div>

          {/* Transparent / No Fill Option Button */}
          {allowTransparent && (
            <button
              type="button"
              onClick={() => handleSelectColor('transparent')}
              className={`mb-2.5 flex w-full items-center justify-between rounded-xl border p-1.5 text-xs font-semibold transition ${
                isTransparent
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Ban className="h-4 w-4 text-red-500" />
                <span>Không màu (No Fill / Transparent)</span>
              </div>
              {isTransparent && <Check className="h-3.5 w-3.5 text-red-600" />}
            </button>
          )}

          {/* Preset Swatches Grid */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Màu có sẵn:
            </span>
            <div className="grid grid-cols-7 gap-1.5">
              {presetColors.map((color) => {
                const isSelected = !isTransparent && value.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleSelectColor(color)}
                    style={{ backgroundColor: color }}
                    className={`relative flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                      isSelected
                        ? 'scale-110 ring-2 ring-blue-500 ring-offset-1 border-white dark:ring-offset-slate-900'
                        : 'border-slate-200 dark:border-slate-700 hover:scale-105'
                    }`}
                    title={color}
                  >
                    {isSelected && (
                      <Check
                        className={`h-3 w-3 ${
                          color === '#ffffff' || color === '#94a3b8'
                            ? 'text-slate-900 font-bold'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
