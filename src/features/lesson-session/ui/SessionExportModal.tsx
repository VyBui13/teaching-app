import React from 'react';
import { Download, FileJson, X, ShieldCheck } from 'lucide-react';
import { LessonSessionAggregate } from '../domain/LessonSessionAggregate';
import { TeachFileSchema } from '../domain/TeachFileSchema';
import { downloadJsonFile } from '../../../core/shared/utils/fileHelpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: LessonSessionAggregate;
}

export const SessionExportModal: React.FC<Props> = ({ isOpen, onClose, session }) => {
  if (!isOpen) return null;

  const annotationCount = session.getTotalAnnotationCount();
  const docName = session.document ? session.document.name : 'Chưa có tài liệu';
  const totalPages = session.document ? session.document.totalPages : 0;
  const fileNameSuggestion = `${(session.title || 'BaiGiang').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.teach.json`;

  const handleDownload = () => {
    const payload = TeachFileSchema.serialize(session);
    downloadJsonFile(payload, fileNameSuggestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Xuất File Bài Giảng (.json)</h3>
              <p className="text-xs text-slate-400">Lưu dữ liệu local 100% không cần Server</p>
            </div>
          </div>

          {/* Session Summary Card */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs text-slate-400">Tên bài giảng:</span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{session.title}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs text-slate-400">Tài liệu đính kèm:</span>
              <span className="text-xs font-semibold text-indigo-400 truncate max-w-[200px]">{docName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs text-slate-400">Tổng số trang:</span>
              <span className="text-xs font-bold text-slate-200">{totalPages} trang</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Tổng thao tác ghi chú (nét vẽ/chữ):</span>
              <span className="text-xs font-extrabold text-amber-400">{annotationCount} nét</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              File JSON xuất ra đã được tối ưu hóa dung lượng (Local-First). Khi dạy tiết học tới, thầy cô chỉ cần chọn <strong>Import File</strong> để khôi phục toàn bộ nét vẽ!
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownload}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
            >
              <FileJson className="w-5 h-5" />
              <span>Tải File .teach.json Về Máy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
