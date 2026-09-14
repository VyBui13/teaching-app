import React from 'react';
import type { ToolType } from '../../../types/annotation';
import {
  MousePointer,
  Pencil,
  Eraser,
  Type,
  Square,
  Circle as CircleIcon,
  ArrowUpRight,
  Minus,
} from 'lucide-react';

interface Props {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

export const CanvasToolbar: React.FC<Props> = ({ activeTool, onSelectTool }) => {
  const tools: Array<{ id: ToolType; label: string; icon: React.ReactNode }> = [
    { id: 'select', label: 'Con trỏ', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'pencil', label: 'Bút vẽ', icon: <Pencil className="w-4 h-4" /> },
    { id: 'eraser', label: 'Tẩy xóa', icon: <Eraser className="w-4 h-4" /> },
    { id: 'text', label: 'Thêm Chữ', icon: <Type className="w-4 h-4" /> },
    { id: 'rectangle', label: 'Hình Chữ Nhật', icon: <Square className="w-4 h-4" /> },
    { id: 'circle', label: 'Hình Tròn', icon: <CircleIcon className="w-4 h-4" /> },
    { id: 'arrow', label: 'Mũi Tên', icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'line', label: 'Đường Thẳng', icon: <Minus className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col gap-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-200">
      {tools.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelectTool(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
            }`}
            title={t.label}
          >
            {t.icon}
            <span className="hidden md:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
