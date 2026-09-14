import React from 'react';
import { Loader2, FileText, Sparkles } from 'lucide-react';

interface Props {
  isLoading: boolean;
  message?: string;
}

export const ProcessingLoader: React.FC<Props> = ({ isLoading, message = 'Đang phân tích & xử lý tài liệu...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-4 text-slate-100 animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Đang Tải Bài Giảng</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-xl">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Vui lòng chờ trong giây lát...</span>
        </div>
      </div>
    </div>
  );
};
