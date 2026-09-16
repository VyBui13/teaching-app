import React, { useState } from 'react';
import type { ToolSettings, ToolType } from '../../../types/annotation';
import { AnnotationEntity } from '../domain/AnnotationEntity';
import { TextBoxContextualSection } from '../../ppt-text-box/components/TextBoxContextualSection';
import {
  MousePointer,
  Pencil,
  Eraser,
  Type,
  Square,
  Circle as CircleIcon,
  ArrowUpRight,
  Minus,
  PanelLeft,
  RotateCcw,
  RotateCw,
  Trash2,
  ChevronDown,
} from 'lucide-react';

interface Props {
  settings: ToolSettings;
  onChangeSettings: (newSettings: Partial<ToolSettings>) => void;
  onClearPage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  selectedAnnotation?: AnnotationEntity | null;
  onUpdateSelectedAnnotation?: (updated: AnnotationEntity) => void;
  onDeleteSelectedAnnotation?: () => void;
  onEditSelectedText?: () => void;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#0f172a', // Dark Slate
  '#ffffff', // White
];

export const ToolPropertyBar: React.FC<Props> = ({
  settings,
  onChangeSettings,
  onClearPage,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSidebarOpen,
  onToggleSidebar,
  selectedAnnotation,
  onUpdateSelectedAnnotation,
  onDeleteSelectedAnnotation,
}) => {
  const [isPencilMenuOpen, setIsPencilMenuOpen] = useState(false);

  const tools: Array<{ id: ToolType; label: string; icon: React.ReactNode }> = [
    { id: 'select', label: 'Con trỏ (V)', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'pencil', label: 'Bút vẽ (B)', icon: <Pencil className="w-4 h-4" /> },
    { id: 'eraser', label: 'Tẩy xóa (E)', icon: <Eraser className="w-4 h-4" /> },
    { id: 'text', label: 'Khung chữ (T)', icon: <Type className="w-4 h-4" /> },
    { id: 'rectangle', label: 'Hình chữ nhật (R)', icon: <Square className="w-4 h-4" /> },
    { id: 'circle', label: 'Hình tròn (C)', icon: <CircleIcon className="w-4 h-4" /> },
    { id: 'arrow', label: 'Mũi tên', icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'line', label: 'Đường thẳng', icon: <Minus className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col z-30 select-none text-slate-800 dark:text-slate-100 shadow-sm transition-colors">
      {/* Row 1: Primary Tools & Workspace Controls */}
      <div className="w-full px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left Group: Sidebar Toggle + Tool Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Slide Sidebar Button */}
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
              isSidebarOpen
                ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isSidebarOpen ? 'Đóng danh sách Slide' : 'Mở danh sách Slide'}
          >
            <PanelLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Slides</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* Unified Tool Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            {tools.map((t) => {
              const isActive = settings.activeTool === t.id;

              if (t.id === 'pencil') {
                return (
                  <div key={t.id} className="relative group">
                    <button
                      onClick={() => {
                        onChangeSettings({ activeTool: 'pencil' });
                        setIsPencilMenuOpen(!isPencilMenuOpen);
                      }}
                      onMouseEnter={() => setIsPencilMenuOpen(true)}
                      className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                      }`}
                      title={t.label}
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-white shrink-0"
                        style={{ backgroundColor: settings.strokeColor }}
                      />
                      {t.icon}
                      <span className="hidden xl:inline text-[11px]">{t.label}</span>
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>

                    {/* Hover Dropdown Menu for Pencil Color & Stroke Width */}
                    {isPencilMenuOpen && (
                      <div
                        onMouseLeave={() => setIsPencilMenuOpen(false)}
                        className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl space-y-3 min-w-[220px] animate-in fade-in zoom-in duration-100"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            Bảng màu nét vẽ:
                          </span>
                          <div className="grid grid-cols-5 gap-1.5">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => {
                                  onChangeSettings({ strokeColor: color, activeTool: 'pencil' });
                                }}
                                style={{ backgroundColor: color }}
                                className={`w-6 h-6 rounded-full border transition ${
                                  settings.strokeColor === color
                                    ? 'scale-110 ring-2 ring-indigo-500 border-white'
                                    : 'border-slate-300 dark:border-slate-700 hover:scale-105'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            <span>Cỡ nét vẽ:</span>
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {settings.strokeWidth}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="24"
                            value={settings.strokeWidth}
                            onChange={(e) =>
                              onChangeSettings({ strokeWidth: Number(e.target.value) })
                            }
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={t.id}
                  onClick={() => onChangeSettings({ activeTool: t.id })}
                  className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                  title={t.label}
                >
                  {t.icon}
                  <span className="hidden xl:inline text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Group: Text Font Size & Global Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Text Font Size (if text tool active & no annotation selected) */}
          {!selectedAnnotation && settings.activeTool === 'text' && (
            <select
              value={settings.fontSize}
              onChange={(e) => onChangeSettings({ fontSize: Number(e.target.value) })}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value={14}>14px</option>
              <option value={18}>18px</option>
              <option value={24}>24px</option>
              <option value={32}>32px</option>
              <option value={48}>48px</option>
              <option value={64}>64px</option>
            </select>
          )}

          {/* Undo, Redo, Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-xl border transition ${
                canUndo
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  : 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
              title="Hoàn tác (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-xl border transition ${
                canRedo
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  : 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
              title="Làm lại (Ctrl+Y / Ctrl+U)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClearPage}
              className="p-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-xl transition"
              title="Xóa tất cả nét vẽ trên trang này (Ctrl+E)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: EXTENDED CONTEXTUAL PROPERTY SECTION (Extends when an element is selected) */}
      {selectedAnnotation && (
        <div className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/80 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 bg-indigo-100/80 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg text-xs">
              {selectedAnnotation.type === 'text' ? (
                <>
                  <Type className="w-3.5 h-3.5" />
                  <span>Khung Chữ</span>
                </>
              ) : (
                <>
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Đối tượng đang chọn</span>
                </>
              )}
            </span>

            {/* EXTENDED CONTEXTUAL SECTION FOR TEXT BOX */}
            {selectedAnnotation.type === 'text' && onUpdateSelectedAnnotation && (
              <TextBoxContextualSection
                annotation={selectedAnnotation}
                onUpdateAnnotation={onUpdateSelectedAnnotation}
                onDeleteAnnotation={onDeleteSelectedAnnotation}
              />
            )}

            {/* EXTENDED CONTEXTUAL SECTION FOR CANVAS NON-TEXT SHAPES */}
            {selectedAnnotation.type !== 'text' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 pl-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        if (onUpdateSelectedAnnotation && selectedAnnotation) {
                          const updated = AnnotationEntity.create(
                            { ...selectedAnnotation.toJSON(), color, updatedAt: Date.now() },
                            selectedAnnotation.id
                          );
                          onUpdateSelectedAnnotation(updated);
                        }
                        onChangeSettings({ strokeColor: color });
                      }}
                      style={{ backgroundColor: color }}
                      className={`w-4 h-4 rounded-full border transition ${
                        selectedAnnotation.color === color
                          ? 'scale-125 ring-2 ring-indigo-500 border-white'
                          : 'border-black/10 dark:border-white/20 hover:scale-110'
                      }`}
                      title="Đổi màu"
                    />
                  ))}
                </div>

                {onDeleteSelectedAnnotation && (
                  <button
                    onClick={onDeleteSelectedAnnotation}
                    className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-lg text-xs transition ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                    <span>Xóa</span>
                  </button>
                )}
              </div>
            )}

            {/* ARCHITECTURE READY FOR FUTURE ELEMENT TYPES:
                {selectedAnnotation.type === 'table' && <TableContextualSection ... />}
                {selectedAnnotation.type === 'image' && <ImageContextualSection ... />}
            */}
          </div>
        </div>
      )}
    </div>
  );
};
