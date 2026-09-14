import React, { useState } from 'react';
import { Upload, FileText, FileCode, Presentation, AlertCircle, Sparkles, FileSpreadsheet } from 'lucide-react';
import { PdfParserAdapter } from '../infrastructure/PdfParserAdapter';
import { DocxParserAdapter } from '../infrastructure/DocxParserAdapter';
import { PptxParserAdapter } from '../infrastructure/PptxParserAdapter';
import { DocumentAggregate } from '../domain/DocumentAggregate';
import { readJsonFile } from '../../../core/shared/utils/fileHelpers';
import { type ExportedTeachFilePayload, TeachFileSchema } from '../../lesson-session/domain/TeachFileSchema';
import { LessonSessionAggregate } from '../../lesson-session/domain/LessonSessionAggregate';

interface Props {
  onDocumentImported: (doc: DocumentAggregate) => void;
  onSessionImported: (session: LessonSessionAggregate) => void;
}

export const DualZoneImportArea: React.FC<Props> = ({
  onDocumentImported,
  onSessionImported,
}) => {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDocumentFile = async (file: File) => {
    setErrorMsg(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'pdf') {
        const doc = await PdfParserAdapter.parse(file);
        onDocumentImported(doc);
      } else if (ext === 'docx' || ext === 'doc') {
        const doc = await DocxParserAdapter.parse(file);
        onDocumentImported(doc);
      } else if (ext === 'pptx' || ext === 'ppt') {
        const doc = await PptxParserAdapter.parse(file);
        onDocumentImported(doc);
      } else {
        setErrorMsg('Tài liệu không hỗ trợ. Vui lòng chọn file .pdf, .docx, hoặc .pptx');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi xử lý tài liệu.');
    }
  };

  const handleJsonFile = async (file: File) => {
    setErrorMsg(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'json' || ext === 'teach') {
        const jsonContent = await readJsonFile<ExportedTeachFilePayload>(file);
        const restoredSession = TeachFileSchema.deserialize(jsonContent);
        onSessionImported(restoredSession);
      } else {
        setErrorMsg('Vui lòng chọn file dữ liệu bài giảng .json hoặc .teach');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đọc file .json.');
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none overflow-y-auto transition-colors">
      <div className="max-w-4xl w-full space-y-8 text-center my-auto">
        {/* Banner Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Nền Tảng Trình Chiếu Giảng Dạy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Chọn Hoặc Import Bài Giảng Để Bắt Đầu Tiết Học
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Hệ thống xử lý trực tiếp trên trình duyệt cá nhân (Client-side), bảo mật 100% dữ liệu bài dạy.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-2xl text-xs flex items-center justify-center gap-2 max-w-lg mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dual Import Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* ZONE 1: Document File Upload (PDF, Word, PPTX) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setActiveZone('doc');
            }}
            onDragLeave={() => setActiveZone(null)}
            onDrop={(e) => {
              e.preventDefault();
              setActiveZone(null);
              if (e.dataTransfer.files?.[0]) handleDocumentFile(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById('input-zone-doc')?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:scale-[1.02] shadow-xl shadow-slate-200/50 dark:shadow-none ${
              activeZone === 'doc'
                ? 'border-indigo-500 bg-indigo-500/10 shadow-2xl shadow-indigo-500/20'
                : 'border-slate-300 dark:border-slate-800 hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <input
              id="input-zone-doc"
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleDocumentFile(e.target.files[0])}
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600/20 transition">
              <Presentation className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">ZONE 1: Import Tài Liệu Học</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Kéo thả hoặc tải lên các file bài giảng <br />
              <strong className="text-indigo-600 dark:text-indigo-400">PDF, Word (.docx), PowerPoint (.pptx)</strong>
            </p>

            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-500" /> PDF / DOCX
              </span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-amber-500" /> PPTX
              </span>
            </div>
          </div>

          {/* ZONE 2: JSON Session Restore */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setActiveZone('json');
            }}
            onDragLeave={() => setActiveZone(null)}
            onDrop={(e) => {
              e.preventDefault();
              setActiveZone(null);
              if (e.dataTransfer.files?.[0]) handleJsonFile(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById('input-zone-json')?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:scale-[1.02] shadow-xl shadow-slate-200/50 dark:shadow-none ${
              activeZone === 'json'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-2xl shadow-emerald-500/20'
                : 'border-slate-300 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <input
              id="input-zone-json"
              type="file"
              accept=".json,.teach"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleJsonFile(e.target.files[0])}
            />

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600/20 transition">
              <FileCode className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">ZONE 2: Import File Đã Lưu (.json)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Khôi phục lại tiết học đã xuất ra trước đó <br />
              <strong className="text-emerald-600 dark:text-emerald-400">Giữ nguyên toàn bộ nét vẽ & ghi chú</strong>
            </p>

            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
              <Upload className="w-3 h-3 text-emerald-500" /> Restore .teach.json
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
