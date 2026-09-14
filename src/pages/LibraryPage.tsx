import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FolderKanban, Play } from 'lucide-react';
import { SampleDocumentFactory } from '../features/document-viewer/infrastructure/SampleDocumentFactory';
import { useLessonSessionContext } from '../context/LessonSessionContext';
import { useNavigate } from 'react-router-dom';

export const LibraryPage: React.FC = () => {
  const { importDocument } = useLessonSessionContext();
  const navigate = useNavigate();

  const handleLoadSample = () => {
    const sample = SampleDocumentFactory.createSample();
    importDocument(sample);
    navigate('/');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 space-y-6 text-slate-100 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            <span>Thư Viện Bài Giảng & Mẫu Sơ Đồ</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Các giáo án mẫu có sẵn chuẩn thiết kế AI-Driven Design</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-indigo-500/40 bg-slate-900/90">
          <CardHeader>
            <Badge variant="indigo">Bài Giảng Mẫu Chuẩn</Badge>
            <CardTitle className="mt-2 text-base font-bold">Ứng Dụng AI-Driven Trong Giáo Dục</CardTitle>
            <CardDescription>2 Trang slide tương tác + Sơ đồ quy trình 3 bước</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-300">
              Bài giảng mẫu chứa sẵn các câu hỏi gợi mở, mục tiêu bài học và vùng vẽ thực hành ghi chú trực tiếp cho giáo viên.
            </p>
            <Button
              onClick={handleLoadSample}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs py-2 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Nạp Bài Giảng Này Để Dạy Ngay</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-75">
          <CardHeader>
            <Badge variant="secondary">Sắp Ra Mắt</Badge>
            <CardTitle className="mt-2 text-base font-bold">Mẫu Sơ Đồ Tư Duy (Mindmap Template)</CardTitle>
            <CardDescription>Dành cho tiết ôn tập kiến thức cuối chương</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-400">Khung bài học hỗ trợ vẽ cây thư mục khái niệm và nối đường mũi tên.</p>
            <Button disabled variant="outline" className="w-full text-xs opacity-50">
              Đang Phát Triển
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
