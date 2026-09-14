import React from 'react';
import {
  GraduationCap,
  Presentation,
  PenTool,
  Save,
  Users,
  Timer,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useTeachingContext } from '../../context/TeachingContext';

interface Props {
  onOpenExportModal: () => void;
  onOpenStudentPicker: () => void;
  onOpenTimer: () => void;
}

export const AppHeader: React.FC<Props> = ({
  onOpenExportModal,
  onOpenStudentPicker,
  onOpenTimer,
}) => {
  const {
    session,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    clearActiveSession,
  } = useTeachingContext();

  return (
    <header className="h-16 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-40 select-none text-slate-800 dark:text-slate-100 shrink-0 transition-colors">
      {/* Brand & Dynamic Logo + Back Button */}
      <div className="flex items-center gap-3">
        {session && (
          <button
            onClick={clearActiveSession}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
            title="Quay lại trang Import bài học khác"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Đổi Bài / Import</span>
          </button>
        )}

        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm dark:shadow-indigo-500/20 transition-colors">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Teaching Platform</span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
            {session ? session.title : 'Chế độ Trình chiếu & Bảng Trắng'}
          </p>
        </div>
      </div>

      {/* Center Mode Switcher: Slide Chiếu vs Bảng Trắng */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={() => setViewMode('slide')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            viewMode === 'slide'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Slide Chiếu</span>
        </button>

        <button
          onClick={() => setViewMode('whiteboard')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            viewMode === 'whiteboard'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Bảng Trắng</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {session ? (
          <>
            <button
              onClick={onOpenStudentPicker}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 rounded-xl border border-slate-200 dark:border-slate-700 transition"
              title="Gọi học sinh ngẫu nhiên"
            >
              <Users className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenTimer}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 rounded-xl border border-slate-200 dark:border-slate-700 transition"
              title="Bấm giờ lớp học"
            >
              <Timer className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenExportModal}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
              title="Lưu bài học về máy (.json)"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Bài Học</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          </>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            Sẵn sàng nhận file
          </div>
        )}

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
          title={`Chuyển sang giao diện ${theme === 'light' ? 'Tối (Dark)' : 'Sáng (Light)'}`}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Chế độ Tối</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Chế độ Sáng</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
