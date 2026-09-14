import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Presentation, LayoutDashboard, FolderKanban, Settings, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FileImportModal } from '../features/document-viewer/ui/FileImportModal';
import { useLessonSessionContext } from '../context/LessonSessionContext';

export const MainLayout: React.FC = () => {
  const {
    isImportModalOpen,
    setIsImportModalOpen,
    importDocument,
    importSession,
  } = useLessonSessionContext();

  const navItems = [
    { to: '/', label: 'Phòng Giảng Dạy', icon: <Presentation className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Tổng Quan & Kho Bài', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/library', label: 'Thư Viện Bài Mẫu', icon: <FolderKanban className="w-4 h-4" /> },
    { to: '/settings', label: 'Cấu Hình Hệ Thống', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Global Layout Header */}
      <nav className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-5">
          <span className="text-xs font-black text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text uppercase tracking-wider flex items-center gap-1.5">
            🎓 AI Teaching Platform
          </span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            onClick={() => setIsImportModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-0 shadow-md shadow-indigo-500/20"
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            <span>Import Tài Liệu</span>
          </Button>
        </div>
      </nav>

      {/* Main Page Outlet */}
      <div className="flex-1 flex overflow-hidden">
        <Outlet />
      </div>

      {/* Global Import File Modal */}
      <FileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDocumentImported={(doc) => {
          importDocument(doc);
        }}
        onSessionImported={(importedSession) => {
          importSession(importedSession);
        }}
      />
    </div>
  );
};
