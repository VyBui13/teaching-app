import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BookOpen, Upload, Presentation, Sparkles, FolderOpen } from 'lucide-react';
import { useLessonSessionContext } from '../context/LessonSessionContext';

export const DashboardPage: React.FC = () => {
  const { session, setIsImportModalOpen } = useLessonSessionContext();
  const navigate = useNavigate();
  const doc = session.document;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 space-y-8 text-slate-100 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <Badge variant="indigo" className="px-3 py-1">
            ✨ Hệ Thống Giảng Dạy AI-Driven (No-DB Architecture)
          </Badge>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Chào Mừng Thầy Cô Đến Với Không Gian Giảng Dạy Trực Tác
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ứng dụng tối ưu hóa trải nghiệm giảng dạy hoàn toàn trên trình duyệt (Local First). Tự động lưu vết nét vẽ, bài soạn, tóm tắt AI và xuất file .json tiện lợi.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-5 py-2.5 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            >
              <Presentation className="w-4 h-4" />
              <span>Vào Trang Trình Chiếu Bài Giảng</span>
            </Button>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl px-5 py-2.5 flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Import File Word / PDF / JSON</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid of Quick Status & Active Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-500/30 bg-slate-900/80">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Badge variant="indigo">Bài Giảng Hiện Tại</Badge>
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <CardTitle className="mt-2 text-base font-bold truncate">{session.title}</CardTitle>
            <CardDescription>File: {doc ? doc.name : 'Chưa chọn file'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Tổng số trang:</span>
              <strong className="text-slate-200">{doc ? doc.totalPages : 0} trang</strong>
            </div>
            <div className="flex justify-between">
              <span>Thao tác nét vẽ ghi chú:</span>
              <strong className="text-amber-400">{session.getTotalAnnotationCount()} nét</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Badge variant="success">Chế Độ Lưu Dữ Liệu</Badge>
              <FolderOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <CardTitle className="mt-2 text-base font-bold">Local-First (No-DB)</CardTitle>
            <CardDescription>Bảo mật 100% dữ liệu lớp học</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-400">
            <p>Dữ liệu bài dạy tự động lưu ở trình duyệt cá nhân. Thầy cô có thể tải về file <code>.teach.json</code> bất cứ lúc nào.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Badge variant="amber">AI Trợ Giảng</Badge>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <CardTitle className="mt-2 text-base font-bold">Tính Năng Thông Minh</CardTitle>
            <CardDescription>Tóm tắt, Tạo Quiz & Thảo luận</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-400">
            <p>Phân tích tức thì văn bản trang bài giảng để tự tạo câu hỏi trắc nghiệm và gợi ý tương tác với học sinh.</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Showcase List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span>🚀 Danh Sách Công Cụ Đang Hoạt Động</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              ✏️
            </div>
            <h4 className="font-bold text-sm text-slate-200">Bút Vẽ & Nét Viết Canvas</h4>
            <p className="text-xs text-slate-400">Pencil, Highlighter, Laser pointer, Hình tròn/vuông/mũi tên.</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              🖥️
            </div>
            <h4 className="font-bold text-sm text-slate-200">Bảng Đen Viết Tự Do</h4>
            <p className="text-xs text-slate-400">Chuyển sang giao diện bảng đen/xanh để viết bài trực tiếp.</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              🎯
            </div>
            <h4 className="font-bold text-sm text-slate-200">Gọi Học Sinh Ngẫu Nhiên</h4>
            <p className="text-xs text-slate-400">Vòng quay chọn tên ngẫu nhiên kết hợp hiệu ứng pháo hoa.</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              💾
            </div>
            <h4 className="font-bold text-sm text-slate-200">Xuất File Local JSON</h4>
            <p className="text-xs text-slate-400">Lưu lại bài dạy đầy đủ nét vẽ để tái sử dụng ở lớp khác.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
