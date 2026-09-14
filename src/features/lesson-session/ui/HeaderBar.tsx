import React from 'react';
import {
  Upload,
  Download,
  Users,
  Timer,
  Presentation,
  Sparkles,
  Save,
  GraduationCap,
} from 'lucide-react';

interface Props {
  title: string;
  autoSaveStatus: 'saved' | 'saving' | 'error';
  onOpenImport: () => void;
  onOpenExport: () => void;
  onToggleBlackboard: () => void;
  onOpenStudentPicker: () => void;
  onOpenTimer: () => void;
  onOpenAIAssistant: () => void;
}

export const HeaderBar: React.FC<Props> = ({
  title,
  autoSaveStatus,
  onOpenImport,
  onOpenExport,
  onToggleBlackboard,
  onOpenStudentPicker,
  onOpenTimer,
  onOpenAIAssistant,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-5 flex items-center justify-between z-30 select-none">
      {/* Brand & Document Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-100 max-w-[220px] sm:max-w-xs truncate">
              {title || 'Giáo Án Trực Tác AI'}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              No-DB Local Mode
            </span>
          </div>
          {/* Auto Save Status Badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Save className="w-3 h-3 text-emerald-400" />
            <span>
              {autoSaveStatus === 'saved'
                ? 'Đã tự động lưu vào trình duyệt (Local)'
                : autoSaveStatus === 'saving'
                ? 'Đang lưu...'
                : 'Lỗi lưu dữ liệu'}
            </span>
          </div>
        </div>
      </div>

      {/* Teaching Tool Buttons */}
      <div className="flex items-center gap-2">
        {/* Blackboard Toggle */}
        <button
          onClick={onToggleBlackboard}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          title="Bật/Tắt Bảng Đen Viết Tự Do"
        >
          <Presentation className="w-4 h-4 text-emerald-400" />
          <span className="hidden lg:inline">Bảng Viết</span>
        </button>

        {/* Student Picker */}
        <button
          onClick={onOpenStudentPicker}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          title="Gọi Học Sinh Ngẫu Nhiên"
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span className="hidden lg:inline">Gọi Học Sinh</span>
        </button>

        {/* Timer */}
        <button
          onClick={onOpenTimer}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          title="Bấm Giờ Lớp Học"
        >
          <Timer className="w-4 h-4 text-cyan-400" />
          <span className="hidden lg:inline">Bấm Giờ</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={onOpenAIAssistant}
          className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition"
          title="Trợ Lý Trợ Giảng AI (Tóm tắt, Tạo Quiz)"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Trợ Lý AI</span>
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        {/* Import Document Button */}
        <button
          onClick={onOpenImport}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          title="Import file Word, PDF hoặc file JSON cũ"
        >
          <Upload className="w-4 h-4 text-indigo-400" />
          <span>Import File</span>
        </button>

        {/* Export JSON Download Button */}
        <button
          onClick={onOpenExport}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
          title="Tải file .json về máy để lưu thao tác giảng dạy"
        >
          <Download className="w-4 h-4" />
          <span>Xuất File JSON (.teach)</span>
        </button>
      </div>
    </header>
  );
};
