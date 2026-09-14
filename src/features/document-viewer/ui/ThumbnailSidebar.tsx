import React from 'react';
import { DocumentAggregate } from '../domain/DocumentAggregate';
import { Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  document: DocumentAggregate | null;
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
}

export const ThumbnailSidebar: React.FC<Props> = ({
  isOpen,
  document,
  currentPageIndex,
  onSelectPage,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none shrink-0 transition-colors z-20">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Danh Sách Slide ({document.totalPages})
        </span>
      </div>

      {/* Slide Thumbnails List View */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {document.pages.map((p, idx) => {
          const isSelected = idx === currentPageIndex;
          return (
            <div
              key={idx}
              onClick={() => onSelectPage(idx)}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="font-bold">Trang {idx + 1}</span>
                {isSelected && (
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Đang chiếu
                  </span>
                )}
              </div>

              {p.dataUrl ? (
                <img
                  src={p.dataUrl}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                />
              ) : (
                <div className="w-full h-28 bg-slate-50 dark:bg-slate-950 rounded-xl p-2 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 overflow-hidden line-clamp-6 leading-tight">
                  {p.textContent || 'Nội dung slide...'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
