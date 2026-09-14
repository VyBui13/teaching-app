import { DocumentAggregate } from '../domain/DocumentAggregate';
import { DocumentPageVO } from '../domain/DocumentPageVO';

export class SampleDocumentFactory {
  static createSample(): DocumentAggregate {
    const page1Html = `
      <div class="p-8 space-y-6 text-slate-800 dark:text-slate-100 font-sans">
        <div class="border-b pb-4 border-indigo-500/20">
          <span class="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">Bài Giảng Mẫu - Công Nghệ AI</span>
          <h1 class="text-3xl font-extrabold mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Chủ Đề: Ứng Dụng AI-Driven Trong Giáo Dục
          </h1>
          <p class="text-slate-500 text-sm mt-1">Giảng viên: Giáo Trình Điện Tử Kỷ Nguyên Số</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-indigo-50/50 dark:bg-slate-800/50 rounded-xl border border-indigo-100 dark:border-slate-700">
            <h3 class="font-bold text-indigo-700 dark:text-indigo-300 mb-2">🎯 Mục Tiêu Bài Học</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li>Hiểu rõ khái niệm AI-Driven Design</li>
              <li>Tự tương tác với công cụ viết vẽ trực tiếp</li>
              <li>Lưu và quản lý file bài giảng (.json) local</li>
            </ul>
          </div>
          <div class="p-4 bg-purple-50/50 dark:bg-slate-800/50 rounded-xl border border-purple-100 dark:border-slate-700">
            <h3 class="font-bold text-purple-700 dark:text-purple-300 mb-2">💡 Lưu Ý Cho Giáo Viên</h3>
            <p class="text-sm text-slate-600 dark:text-slate-300">
              Sử dụng <strong>Pencil</strong> để ghi chú câu trả lời của học sinh, <strong>Shape</strong> để khoanh vùng kiến thức trọng tâm!
            </p>
          </div>
        </div>

        <div class="bg-slate-900 text-slate-100 p-5 rounded-xl space-y-3 shadow-md">
          <h2 class="text-lg font-bold text-amber-400">❓ Câu Hỏi Thảo Luận Nhanh</h2>
          <p class="text-sm text-slate-300 leading-relaxed">
            "Theo thầy/cô, ưu điểm lớn nhất của ứng dụng không phụ thuộc Database (No-DB App) đối với sự riêng tư dữ liệu của lớp học là gì?"
          </p>
          <div class="h-24 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-xs">
            [Vùng để thầy cô vẽ/viết ghi chú trực tiếp bằng công cụ Pencil hoặc Textbox]
          </div>
        </div>
      </div>
    `;

    const page2Html = `
      <div class="p-8 space-y-6 text-slate-800 dark:text-slate-100 font-sans">
        <div class="border-b pb-4 border-emerald-500/20">
          <span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider">Trang 2 - Sơ Đồ Kiến Thức</span>
          <h2 class="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
            Quy Trình Tương Tác Giảng Dạy Trực Tiếp
          </h2>
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">1</div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100">Import Tài Liệu (PDF / Word / JSON)</h4>
              <p class="text-xs text-slate-500">Hệ thống xử lý trực tiếp trên trình duyệt client-side, bảo mật 100%.</p>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div class="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">2</div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100">Ghi Chú & Tương Tác Sôi Nổi</h4>
              <p class="text-xs text-slate-500">Sử dụng Laser Pointer, Bút vẽ nhiều màu, Hình khối, Gọi học sinh ngẫu nhiên.</p>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100">Xuất File (.json) Lưu Trữ Local</h4>
              <p class="text-xs text-slate-500">Tải file về máy cá nhân và dễ dàng import lại cho tiết học sau.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    return DocumentAggregate.create({
      name: 'Giáo Án Mẫu - AI Driven Design.sample',
      fileType: 'sample',
      sizeBytes: 1024 * 45,
      totalPages: 2,
      pages: [
        new DocumentPageVO({
          pageIndex: 0,
          width: 800,
          height: 1100,
          htmlContent: page1Html,
          textContent: 'Bài Giảng Mẫu AI Driven Design Mục tiêu bài học Tương tác trực tiếp Lưu và quản lý file json',
        }),
        new DocumentPageVO({
          pageIndex: 1,
          width: 800,
          height: 1100,
          htmlContent: page2Html,
          textContent: 'Sơ đồ kiến thức Quy trình tương tác giảng dạy Import tài liệu Ghi chú Xuất file json',
        }),
      ],
      uploadedAt: Date.now(),
    });
  }
}
