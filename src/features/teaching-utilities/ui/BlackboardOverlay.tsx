import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { drawSmoothPath, type Point } from '../../../core/shared/utils/canvasUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BlackboardOverlay: React.FC<Props> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theme, setTheme] = useState<'dark' | 'green' | 'white'>('dark');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [paths, setPaths] = useState<Array<{ points: Point[]; color: string; width: number }>>([]);
  const [color, setColor] = useState('#ffffff');
  const width = 3;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all blackboard paths
    paths.forEach((p) => {
      drawSmoothPath(ctx, p.points, p.color, p.width, 1);
    });

    if (isDrawing && currentPath.length > 1) {
      drawSmoothPath(ctx, currentPath, color, width, 1);
    }
  }, [paths, currentPath, isDrawing, color, width, isOpen]);

  if (!isOpen) return null;

  const bgColors = {
    dark: 'bg-slate-950',
    green: 'bg-emerald-950',
    white: 'bg-slate-100 text-slate-900',
  };

  const defaultColors = {
    dark: ['#ffffff', '#fef08a', '#86efac', '#93c5fd', '#fca5a5'],
    green: ['#ffffff', '#fef08a', '#f472b6', '#a7f3d0', '#fb923c'],
    white: ['#0f172a', '#ef4444', '#2563eb', '#059669', '#d97706'],
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${bgColors[theme]} transition-colors`}>
      {/* Top Floating Controls */}
      <div className="p-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-200">Bảng Viết Tự Do</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setTheme('dark');
                setColor('#ffffff');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                theme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Bảng Đen
            </button>
            <button
              onClick={() => {
                setTheme('green');
                setColor('#ffffff');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                theme === 'green' ? 'bg-emerald-800 text-white' : 'text-slate-400'
              }`}
            >
              Bảng Xanh
            </button>
            <button
              onClick={() => {
                setTheme('white');
                setColor('#0f172a');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                theme === 'white' ? 'bg-slate-300 text-slate-900' : 'text-slate-400'
              }`}
            >
              Bảng Trắng
            </button>
          </div>
        </div>

        {/* Color Palette & Clear */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {defaultColors[theme].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border-2 transition ${
                  color === c ? 'scale-125 border-indigo-400' : 'border-transparent'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaths([])}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-500/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Bảng</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Fullscreen Canvas */}
      <div className="flex-1 relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 60}
          onMouseDown={(e) => {
            setIsDrawing(true);
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              setCurrentPath([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
            }
          }}
          onMouseMove={(e) => {
            if (!isDrawing) return;
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              setCurrentPath((prev) => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
            }
          }}
          onMouseUp={() => {
            if (!isDrawing) return;
            setIsDrawing(false);
            if (currentPath.length > 1) {
              setPaths((prev) => [...prev, { points: currentPath, color, width }]);
            }
            setCurrentPath([]);
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
