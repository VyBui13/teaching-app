import React, { useRef, useEffect } from 'react';
import { DocumentAggregate } from '../domain/DocumentAggregate';
import { AnnotationCanvasOverlay } from '../../annotation-canvas/ui/AnnotationCanvasOverlay';
import { AnnotationEntity } from '../../annotation-canvas/domain/AnnotationEntity';
import type { ToolSettings, ToolType } from '../../../types/annotation';

interface Props {
  document: DocumentAggregate | null;
  currentPageIndex: number;
  annotations: Record<number, AnnotationEntity[]>;
  toolSettings: ToolSettings;
  onAddAnnotation: (annotation: AnnotationEntity) => void;
  onUpdateAnnotation?: (annotation: AnnotationEntity) => void;
  onDeleteAnnotation?: (id: string) => void;
  onSelectAnnotation?: (annotation: AnnotationEntity | null) => void;
  editingTextId?: string | null;
  onDoneEditingText?: () => void;
  onSwitchTool?: (tool: ToolType) => void;
  onOpenImportModal: () => void;
  onSelectPage?: (index: number) => void;
}

export const DocumentStage: React.FC<Props> = ({
  document,
  currentPageIndex,
  annotations,
  toolSettings,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onSelectAnnotation,
  editingTextId,
  onDoneEditingText,
  onSwitchTool,
  onOpenImportModal,
  onSelectPage,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Set up IntersectionObserver to detect which slide is currently visible during continuous scroll
  useEffect(() => {
    if (!document || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const pageAttr = entry.target.getAttribute('data-page-index');
            if (pageAttr !== null && onSelectPage) {
              const idx = parseInt(pageAttr, 10);
              onSelectPage(idx);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0.4, 0.7],
      }
    );

    const slideElements = containerRef.current.querySelectorAll('.slide-page-container');
    slideElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [document, onSelectPage]);

  // Smoothly scroll to slide when currentPageIndex changes externally (e.g. thumbnail click)
  useEffect(() => {
    const el = document ? containerRef.current?.querySelector(`#slide-page-${currentPageIndex}`) : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPageIndex, document]);

  if (!document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-center transition-colors">
        <div className="max-w-md p-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-3xl">
            📚
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Chưa chọn bài giảng</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hãy import file Word (.docx), PDF, PowerPoint (.pptx) hoặc file dữ liệu bài giảng (.json) để bắt đầu trình chiếu.
            </p>
          </div>
          <button
            onClick={onOpenImportModal}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 transition duration-200"
          >
            📂 Import Tài Liệu Giảng Dạy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex flex-col items-center py-8 px-6 space-y-10 min-h-full transition-colors scroll-smooth"
    >
      {/* CONTINUOUS VERTICAL SCROLL OF ALL SLIDES (Google Drive PDF style) */}
      {document.pages.map((page, idx) => {
        const pageAnnotations = annotations[idx] || [];
        const width = page.width || 800;
        const height = page.height || 1100;

        return (
          <div
            key={idx}
            id={`slide-page-${idx}`}
            data-page-index={idx}
            className="slide-page-container flex flex-col items-center group space-y-2 shrink-0"
          >
            {/* Page Header Badge */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
                Trang {idx + 1} / {document.totalPages}
              </span>
            </div>

            {/* Individual Slide Canvas Box */}
            <div
              className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border transition-all ${
                idx === currentPageIndex
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              style={{ width, height, minWidth: width, minHeight: height }}
            >
              {/* Render PDF Canvas Data URL if PDF */}
              {page.dataUrl && (
                <img
                  src={page.dataUrl}
                  alt={`Page ${idx + 1}`}
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              )}

              {/* Render Docx / PPTX HTML content */}
              {page.htmlContent && !page.dataUrl && (
                <div
                  className="w-full h-full overflow-y-auto pointer-events-none select-none"
                  dangerouslySetInnerHTML={{ __html: page.htmlContent }}
                />
              )}

              {/* Annotation Layer Overlay for each slide */}
              <div className="absolute inset-0 z-10">
                <AnnotationCanvasOverlay
                  width={width}
                  height={height}
                  pageIndex={idx}
                  currentPageIndex={currentPageIndex}
                  annotations={pageAnnotations}
                  toolSettings={toolSettings}
                  onAddAnnotation={onAddAnnotation}
                  onUpdateAnnotation={onUpdateAnnotation}
                  onDeleteAnnotation={onDeleteAnnotation}
                  onSelectAnnotation={onSelectAnnotation}
                  editingTextId={editingTextId}
                  onDoneEditingText={onDoneEditingText}
                  onSwitchTool={onSwitchTool}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
