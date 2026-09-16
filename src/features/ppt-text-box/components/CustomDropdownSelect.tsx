import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T extends string | number> {
  label: string;
  value: T;
  icon?: React.ReactNode;
  previewStyle?: React.CSSProperties;
}

interface Props<T extends string | number> {
  label?: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (val: T) => void;
  icon?: React.ReactNode;
  title?: string;
}

export function CustomDropdownSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  icon,
  title,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

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

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-7 items-center justify-between gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-all ${
          isOpen
            ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/60'
            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
        }`}
        title={title || label}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="text-slate-500 dark:text-slate-400">{icon}</span>}
          <span className="truncate text-slate-800 dark:text-slate-200" style={selectedOption?.previewStyle}>
            {selectedOption?.label || String(value)}
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[140px] max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 dark:border-slate-800 dark:bg-slate-900">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate" style={opt.previewStyle}>
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
