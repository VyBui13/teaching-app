import React, { useState } from 'react';
import { Sparkles, X, HelpCircle, FileText, MessageSquare } from 'lucide-react';
import { AIAssistantEngine, type AIAnalysisResult } from '../domain/AIAssistantEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pageText: string;
  currentPageIndex: number;
}

export const AIAssistantDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  pageText,
  currentPageIndex,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'discussion'>('summary');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const analysis: AIAnalysisResult = AIAssistantEngine.analyzePageText(pageText, currentPageIndex);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Trợ Lý Giảng Dạy AI</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'summary'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tóm Tắt</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Tạo Quiz ({analysis.quizzes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('discussion')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'discussion'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Thảo Luận</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tóm Tắt Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">📝 Tóm tắt trang {currentPageIndex + 1}</span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{analysis.summary}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Ý Chính Trọng Tâm:</h4>
              <div className="space-y-2">
                {analysis.keyPoints.map((pt, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">AI tự động khởi tạo câu hỏi trắc nghiệm tương tác từ nội dung trang hiện tại:</p>
            {analysis.quizzes.map((q, idx) => (
              <div key={q.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-100 leading-snug">
                  Câu {idx + 1}: {q.question}
                </h5>
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    const isCorrect = q.correctAnswer === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedAnswers[q.id] !== undefined && (
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300">
                    💡 <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Gợi ý câu hỏi gợi mở cho thầy cô đặt câu hỏi tương tác với học sinh:</p>
            {analysis.discussionQuestions.map((q, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold">Gợi ý thảo luận #{idx + 1}</span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
