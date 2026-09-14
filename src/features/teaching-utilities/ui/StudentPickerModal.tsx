import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Users, Sparkles, X, Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  students: string[];
  onUpdateStudents: (list: string[]) => void;
}

export const StudentPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  if (!isOpen) return null;

  const handlePickRandom = () => {
    if (students.length === 0) return;
    setIsSpinning(true);
    setSelectedStudent(null);

    let counter = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * students.length);
      setSelectedStudent(students[idx]);
      counter++;

      if (counter > 20) {
        clearInterval(interval);
        setIsSpinning(false);
        const finalWinner = students[Math.floor(Math.random() * students.length)];
        setSelectedStudent(finalWinner);

        // Trigger confetti celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 80);
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    onUpdateStudents([...students, newStudentName.trim()]);
    setNewStudentName('');
  };

  const handleRemoveStudent = (idx: number) => {
    const next = [...students];
    next.splice(idx, 1);
    onUpdateStudents(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Gọi Học Sinh Ngẫu Nhiên</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tạo sự sôi nổi và công bằng cho tiết học</p>
            </div>
          </div>

          {/* Random Winner Display Box */}
          <div className="h-32 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden transition-colors">
            {selectedStudent ? (
              <div className="space-y-1 animate-bounce">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">🎉 Học sinh được chọn:</span>
                <h2 className="text-2xl font-extrabold text-indigo-600 dark:text-amber-400">
                  {selectedStudent}
                </h2>
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium">Bấm nút bên dưới để chọn ngẫu nhiên học sinh trả lời câu hỏi</p>
            )}
          </div>

          {/* Pick Action Button */}
          <button
            onClick={handlePickRandom}
            disabled={isSpinning || students.length === 0}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Sparkles className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Đang quay chọn...' : 'Quay Số Ngẫu Nhiên'}</span>
          </button>

          {/* Student List Management */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Danh sách lớp ({students.length} học sinh)</h4>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                placeholder="Nhập tên học sinh mới..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddStudent}
                className="px-3 py-2 bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm</span>
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1">
              {students.map((st, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-300"
                >
                  <span>{st}</span>
                  <button
                    onClick={() => handleRemoveStudent(idx)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
