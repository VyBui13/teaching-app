import React from 'react';
import type { ToolSettings, ToolType } from '../../../types/annotation';
import { AnnotationEntity } from '../domain/AnnotationEntity';
import { TextBoxContextualSection } from '../../ppt-text-box/components/TextBoxContextualSection';
import { PencilContextualSection } from './PencilContextualSection';
import { ShapeContextualSection, type ShapeType } from './ShapeContextualSection';
import {
  MousePointer,
  Pencil,
  Eraser,
  Type,
  Shapes,
  PanelLeft,
  RotateCcw,
  RotateCw,
  Trash2,
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
  onUnselectAnnotation?: () => void;
}

const SHAPE_TOOLS: ToolType[] = ['shape', 'rectangle', 'circle', 'arrow', 'line'];

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
  onUnselectAnnotation,
}) => {
  const tools: Array<{ id: ToolType; label: string; icon: React.ReactNode }> = [
    { id: 'select', label: 'Con trỏ (V)', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'pencil', label: 'Bút vẽ (B)', icon: <Pencil className="w-4 h-4" /> },
    { id: 'eraser', label: 'Tẩy xóa (E)', icon: <Eraser className="w-4 h-4" /> },
    { id: 'text', label: 'Khung chữ (T)', icon: <Type className="w-4 h-4" /> },
    { id: 'shape', label: 'Hình khối (S)', icon: <Shapes className="w-4 h-4" /> },
  ];

  const isShapeToolActive =
    SHAPE_TOOLS.includes(settings.activeTool) ||
    (selectedAnnotation ? SHAPE_TOOLS.includes(selectedAnnotation.type) : false);

  const isShapeSelected =
    selectedAnnotation && SHAPE_TOOLS.includes(selectedAnnotation.type);

  const isTextToolActive =
    settings.activeTool === 'text' || selectedAnnotation?.type === 'text';

  const isPencilToolActive =
    settings.activeTool === 'pencil' || selectedAnnotation?.type === 'pencil';

  const isSelectToolActive =
    settings.activeTool === 'select' && !selectedAnnotation;

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
              const isActive =
                t.id === 'shape'
                  ? isShapeToolActive
                  : t.id === 'text'
                  ? isTextToolActive
                  : t.id === 'pencil'
                  ? isPencilToolActive
                  : t.id === 'select'
                  ? isSelectToolActive
                  : settings.activeTool === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onUnselectAnnotation?.();
                    onChangeSettings({ activeTool: t.id });
                  }}
                  className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                  title={t.label}
                >
                  {t.id === 'pencil' && (
                    <div
                      className="w-3 h-3 rounded-full border border-white shrink-0"
                      style={{ backgroundColor: settings.strokeColor }}
                    />
                  )}
                  {t.icon}
                  <span className="hidden xl:inline text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Group: Global Actions (Undo, Redo, Clear) */}
        <div className="flex items-center gap-3 flex-wrap">
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

      {/* Row 2: EXTENDED CONTEXTUAL PROPERTY SECTION */}
      {/* 2 Trigger Methods: (1) Entity selection on canvas OR (2) Active creation tool selection on Row 1 */}
      {(selectedAnnotation || settings.activeTool === 'text' || settings.activeTool === 'pencil' || isShapeToolActive) && (
        <div className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/80 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Context Badge */}
            <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 bg-indigo-100/80 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg text-xs">
              {selectedAnnotation ? (
                selectedAnnotation.type === 'text' ? (
                  <>
                    <Type className="w-3.5 h-3.5" />
                    <span>Khung Chữ (Đang chọn)</span>
                  </>
                ) : selectedAnnotation.type === 'pencil' ? (
                  <>
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Nét Bút Vẽ (Đang chọn)</span>
                  </>
                ) : isShapeSelected ? (
                  <>
                    <Shapes className="w-3.5 h-3.5" />
                    <span>Hình Khối (Đang chọn)</span>
                  </>
                ) : (
                  <>
                    <MousePointer className="w-3.5 h-3.5" />
                    <span>Đối tượng đang chọn</span>
                  </>
                )
              ) : settings.activeTool === 'text' ? (
                <>
                  <Type className="w-3.5 h-3.5" />
                  <span>Cấu hình Khung Chữ</span>
                </>
              ) : settings.activeTool === 'pencil' ? (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Cấu hình Bút Vẽ</span>
                </>
              ) : isShapeToolActive ? (
                <>
                  <Shapes className="w-3.5 h-3.5" />
                  <span>Cấu hình Hình Khối</span>
                </>
              ) : null}
            </span>

            {/* PENCIL EXTEND SECTION - METHOD 1: Selected Pencil Annotation */}
            {selectedAnnotation && selectedAnnotation.type === 'pencil' && (
              <PencilContextualSection
                annotation={selectedAnnotation}
                strokeColor={settings.strokeColor}
                strokeWidth={settings.strokeWidth}
                onChangeStrokeColor={(color) => {
                  if (onUpdateSelectedAnnotation) {
                    const updated = AnnotationEntity.create(
                      { ...selectedAnnotation.toJSON(), color, updatedAt: Date.now() },
                      selectedAnnotation.id
                    );
                    onUpdateSelectedAnnotation(updated);
                  }
                  onChangeSettings({ strokeColor: color });
                }}
                onChangeStrokeWidth={(strokeWidth) => {
                  if (onUpdateSelectedAnnotation) {
                    const updated = AnnotationEntity.create(
                      { ...selectedAnnotation.toJSON(), strokeWidth, updatedAt: Date.now() },
                      selectedAnnotation.id
                    );
                    onUpdateSelectedAnnotation(updated);
                  }
                  onChangeSettings({ strokeWidth });
                }}
                onDeleteAnnotation={onDeleteSelectedAnnotation}
              />
            )}

            {/* PENCIL EXTEND SECTION - METHOD 2: Active Pencil Tool (Default Settings) */}
            {!selectedAnnotation && settings.activeTool === 'pencil' && (
              <PencilContextualSection
                strokeColor={settings.strokeColor}
                strokeWidth={settings.strokeWidth}
                onChangeStrokeColor={(color) => onChangeSettings({ strokeColor: color })}
                onChangeStrokeWidth={(strokeWidth) => onChangeSettings({ strokeWidth })}
              />
            )}

            {/* SHAPE EXTEND SECTION - METHOD 1: Selected Shape Annotation */}
            {isShapeSelected && selectedAnnotation && (
              <ShapeContextualSection
                annotation={selectedAnnotation}
                activeShapeType={(settings.selectedShapeType || 'rectangle') as ShapeType}
                strokeColor={settings.strokeColor}
                fillColor={settings.fillColor}
                strokeWidth={settings.strokeWidth}
                borderStyle={settings.borderStyle || 'solid'}
                onChangeShapeType={(shapeType) => {
                  if (onUpdateSelectedAnnotation) {
                    const updated = AnnotationEntity.create(
                      { ...selectedAnnotation.toJSON(), type: shapeType, updatedAt: Date.now() },
                      selectedAnnotation.id
                    );
                    onUpdateSelectedAnnotation(updated);
                  }
                  onChangeSettings({ selectedShapeType: shapeType });
                }}
                onChangeStrokeColor={(color) => {
                  if (onUpdateSelectedAnnotation) {
                    const updated = AnnotationEntity.create(
                      { ...selectedAnnotation.toJSON(), color, borderColor: color, updatedAt: Date.now() },
                      selectedAnnotation.id
                    );
                    onUpdateSelectedAnnotation(updated);
                  }
                  onChangeSettings({ strokeColor: color });
                }}
                onChangeFillColor={(fillColor) => {
                  if (onUpdateSelectedAnnotation) {
                    const updated = AnnotationEntity.create(
                      { ...selectedAnnotation.toJSON(), fillColor, updatedAt: Date.now() },
                      selectedAnnotation.id
                    );
                    onUpdateSelectedAnnotation(updated);
                  }
                  onChangeSettings({ fillColor });
                }}
                onChangeStrokeWidth={(strokeWidth) => {
                  if (onUpdateSelectedAnnotation) {
                    const updated = AnnotationEntity.create(
                      { ...selectedAnnotation.toJSON(), strokeWidth, borderWidth: strokeWidth, updatedAt: Date.now() },
                      selectedAnnotation.id
                    );
                    onUpdateSelectedAnnotation(updated);
                  }
                  onChangeSettings({ strokeWidth, borderWidth: strokeWidth });
                }}
                onChangeBorderStyle={(borderStyle) => {
                  if (onUpdateSelectedAnnotation) {
                    const updated = AnnotationEntity.create(
                      { ...selectedAnnotation.toJSON(), borderStyle, updatedAt: Date.now() },
                      selectedAnnotation.id
                    );
                    onUpdateSelectedAnnotation(updated);
                  }
                  onChangeSettings({ borderStyle });
                }}
                onDeleteAnnotation={onDeleteSelectedAnnotation}
              />
            )}

            {/* SHAPE EXTEND SECTION - METHOD 2: Active Shape Tool (Default Settings) */}
            {!selectedAnnotation && isShapeToolActive && (
              <ShapeContextualSection
                activeShapeType={(settings.selectedShapeType || 'rectangle') as ShapeType}
                strokeColor={settings.strokeColor}
                fillColor={settings.fillColor}
                strokeWidth={settings.strokeWidth}
                borderStyle={settings.borderStyle || 'solid'}
                onChangeShapeType={(shapeType) => onChangeSettings({ selectedShapeType: shapeType })}
                onChangeStrokeColor={(color) => onChangeSettings({ strokeColor: color })}
                onChangeFillColor={(fillColor) => onChangeSettings({ fillColor })}
                onChangeStrokeWidth={(strokeWidth) => onChangeSettings({ strokeWidth, borderWidth: strokeWidth })}
                onChangeBorderStyle={(borderStyle) => onChangeSettings({ borderStyle })}
              />
            )}

            {/* TEXT BOX EXTEND SECTION - METHOD 1: Selected Text Box */}
            {selectedAnnotation && selectedAnnotation.type === 'text' && onUpdateSelectedAnnotation && (
              <TextBoxContextualSection
                annotation={selectedAnnotation}
                onUpdateAnnotation={onUpdateSelectedAnnotation}
                onDeleteAnnotation={onDeleteSelectedAnnotation}
              />
            )}

            {/* TEXT BOX EXTEND SECTION - METHOD 2: Active Text Tool (Default Settings) */}
            {!selectedAnnotation && settings.activeTool === 'text' && (
              <TextBoxContextualSection
                annotation={
                  AnnotationEntity.create(
                    {
                      pageIndex: 0,
                      type: 'text',
                      color: settings.strokeColor || '#0f172a',
                      strokeWidth: settings.strokeWidth || 2,
                      opacity: settings.opacity || 1,
                      fontSize: settings.fontSize || 20,
                      fontFamily: settings.fontFamily || 'Geist Variable, sans-serif',
                      fillColor: settings.fillColor || 'transparent',
                      borderColor: settings.borderColor || 'transparent',
                      borderWidth: settings.borderWidth ?? 0,
                      borderStyle: settings.borderStyle || 'none',
                      textAlign: settings.textAlign || 'left',
                      fontWeight: settings.fontWeight || 'normal',
                      fontStyle: settings.fontStyle || 'normal',
                      textDecoration: settings.textDecoration || 'none',
                      boxSizingMode: settings.boxSizingMode || 'auto-fit',
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    },
                    'default-text-settings'
                  )
                }
                onUpdateAnnotation={(updated) => {
                  const data = updated.toJSON();
                  onChangeSettings({
                    strokeColor: data.color,
                    fontSize: data.fontSize,
                    fontFamily: data.fontFamily,
                    fillColor: data.fillColor,
                    borderColor: data.borderColor,
                    borderWidth: data.borderWidth,
                    borderStyle: data.borderStyle,
                    textAlign: data.textAlign,
                    fontWeight: data.fontWeight,
                    fontStyle: data.fontStyle,
                    textDecoration: data.textDecoration,
                    boxSizingMode: data.boxSizingMode,
                  });
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
