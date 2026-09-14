import React, { useState } from 'react';
import { Upload, FileText, FileCode, X, AlertCircle } from 'lucide-react';
import { PdfParserAdapter } from '../infrastructure/PdfParserAdapter';
import { DocxParserAdapter } from '../infrastructure/DocxParserAdapter';
import { DocumentAggregate } from '../domain/DocumentAggregate';
import { readJsonFile } from '../../../core/shared/utils/fileHelpers';
import { type ExportedTeachFilePayload, TeachFileSchema } from '../../lesson-session/domain/TeachFileSchema';
import { LessonSessionAggregate } from '../../lesson-session/domain/LessonSessionAggregate';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDocumentImported: (doc: DocumentAggregate) => void;
  onSessionImported: (session: LessonSessionAggregate) => void;
}

export const FileImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onDocumentImported,
  onSessionImported,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'json' || ext === 'teach') {
        const jsonContent = await readJsonFile<ExportedTeachFilePayload>(file);
        const restoredSession = TeachFileSchema.deserialize(jsonContent);
        onSessionImported(restoredSession);
        onClose();
      } else if (ext === 'pdf') {
        const doc = await PdfParserAdapter.parse(file);
        onDocumentImported(doc);
        onClose();
      } else if (ext === 'docx' || ext === 'doc') {
        const doc = await DocxParserAdapter.parse(file);
        onDocumentImported(doc);
        onClose();
      } else {
        setErrorMsg('Định dạng file không hỗ trợ! Vui lòng chọn file .pdf, .docx, hoặc file bài giảng .json.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi đọc file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Import File Bài Giảng</h3>
              <p className="text-xs text-slate-400">Hỗ trợ PDF, Word (.docx) và file ghi chú cũ (.json / .teach)</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition cursor-pointer group"
            onClick={() => document.getElementById('file-input-element')?.click()}
          >
            <input
              id="file-input-element"
              type="file"
              accept=".pdf,.docx,.json,.teach"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />

            {isLoading ? (
              <div className="space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-indigo-300">Đang phân tích & xử lý tài liệu...</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-slate-800 group-hover:bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-3 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Kéo thả file vào đây hoặc <span className="text-indigo-400">Chọn từ máy tính</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Hỗ trợ các file .pdf, .docx, .json (.teach format)</p>
              </>
            )}
          </div>

          {/* File Types Guidance */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <h5 className="text-xs font-bold text-slate-200">Word / PDF</h5>
                <p className="text-[10px] text-slate-400">Tự động chuyển đổi thành slide chiếu</p>
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2.5">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <div>
                <h5 className="text-xs font-bold text-slate-200">File Local (.json)</h5>
                <p className="text-[10px] text-slate-400">Khôi phục nét vẽ & ghi chú đã lưu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
