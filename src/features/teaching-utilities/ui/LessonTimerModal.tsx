import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LessonTimerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(300); // Default 5 mins
  const [isRunning, setIsRunning] = useState(false);
  const [presetMinutes, setPresetMinutes] = useState(5);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      alert('⏰ Hết giờ làm bài / thảo luận!');
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetTimer = (mins: number) => {
    setPresetMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(presetMinutes * 60);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-2 text-cyan-600 dark:text-cyan-400">
            <Timer className="w-6 h-6" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bấm Giờ Lớp Học</h3>
          </div>

          {/* Large Digital Clock Display */}
          <div className="bg-slate-50 dark:bg-slate-950 py-6 px-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner transition-colors">
            <span className="text-5xl font-black font-mono text-cyan-600 dark:text-cyan-400 tracking-wider">
              {formatTime(secondsLeft)}
            </span>
          </div>

          {/* Quick Preset Timer Buttons */}
          <div className="flex justify-center gap-2">
            {[1, 3, 5, 10, 15].map((m) => (
              <button
                key={m}
                onClick={() => handleSetTimer(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  presetMinutes === m
                    ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {m} phút
              </button>
            ))}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Tạm Dừng' : 'Bắt Đầu'}</span>
            </button>
            <button
              onClick={handleReset}
              className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
              title="Đặt lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
