import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PPTTextBox, TextBoxStyle } from '../types/textbox.types';
import { PPTTextBoxComponent } from './PPTTextBoxComponent';
import {
  Plus,
  Grid,
  Activity,
  Download,
  RotateCcw,
  Sparkles,
  Layout,
  Type,
} from 'lucide-react';

const DEFAULT_STYLE: TextBoxStyle = {
  fontSize: 24,
  fontFamily: 'Geist Variable, sans-serif',
  textColor: '#0f172a',
  backgroundColor: '#ffffff',
  borderColor: '#3b82f6',
  borderWidth: 2,
  borderStyle: 'solid',
  borderRadius: 8,
  padding: 12,
  textAlign: 'left',
  verticalAlign: 'top',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  boxSizingMode: 'auto-fit',
  lineHeight: 1.35,
  opacity: 1,
};

const SAMPLE_TEXTBOXES: PPTTextBox[] = [
  {
    id: 'box-title-1',
    x: 80,
    y: 60,
    width: 640,
    height: 120,
    text: 'PowerPoint Interactive Text Box\nZero-Lag Canvas Architecture ⚡',
    style: {
      ...DEFAULT_STYLE,
      fontSize: 32,
      fontWeight: 'bold',
      textColor: '#1e293b',
      backgroundColor: '#f0f9ff',
      borderColor: '#0284c7',
      borderWidth: 2,
      borderStyle: 'solid',
      padding: 16,
      textAlign: 'center',
    },
    zIndex: 10,
  },
  {
    id: 'box-body-2',
    x: 80,
    y: 220,
    width: 420,
    height: 180,
    text: '• Drag & drop with GPU translate3d\n• 8-Point resize handles + Shift aspect lock\n• Automatic text wrapping & Auto-fit shape\n• Smart alignment snapping guides (Red lines)',
    style: {
      ...DEFAULT_STYLE,
      fontSize: 18,
      textColor: '#334155',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1.5,
      padding: 14,
      boxSizingMode: 'fixed-bounds',
    },
    zIndex: 5,
  },
  {
    id: 'box-callout-3',
    x: 540,
    y: 220,
    width: 360,
    height: 180,
    text: '🚀 High Performance Guarantee:\n- No continuous React re-renders on pointermove\n- Direct rAF DOM transform updates\n- PointerCapture prevents cursor loss',
    style: {
      ...DEFAULT_STYLE,
      fontSize: 16,
      textColor: '#065f46',
      backgroundColor: '#ecfdf5',
      borderColor: '#10b981',
      borderWidth: 2,
      borderStyle: 'dashed',
      padding: 14,
    },
    zIndex: 6,
  },
];

export const PPTCanvasPlayground: React.FC = () => {
  const [boxes, setBoxes] = useState<PPTTextBox[]>(SAMPLE_TEXTBOXES);
  const [selectedId, setSelectedId] = useState<string | null>('box-title-1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);

  // Performance Monitor state (FPS counter & frame latency)
  const [fps, setFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(0.5);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  const canvasWidth = 1000;
  const canvasHeight = 600;

  // FPS Monitor Loop
  useEffect(() => {
    let animId: number;
    const calcFPS = (now: number) => {
      frameCountRef.current++;
      const delta = now - lastTimeRef.current;
      if (delta >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(currentFps);
        setFrameTimeMs(Number((1000 / currentFps).toFixed(2)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      animId = requestAnimationFrame(calcFPS);
    };
    animId = requestAnimationFrame(calcFPS);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Keyboard Shortcuts (Delete, Duplicate Ctrl+D, Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingId) return; // Don't trigger shortcuts when typing in text field

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        setBoxes((prev) => prev.filter((b) => b.id !== selectedId));
        setSelectedId(null);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        handleDuplicate(selectedId);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      } else if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setBoxes((prev) =>
          prev.map((b) => {
            if (b.id !== selectedId) return b;
            let { x, y } = b;
            if (e.key === 'ArrowUp') y -= step;
            if (e.key === 'ArrowDown') y += step;
            if (e.key === 'ArrowLeft') x -= step;
            if (e.key === 'ArrowRight') x += step;
            return { ...b, x, y };
          })
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingId]);

  // Actions
  const handleAddBox = (preset: 'title' | 'body' | 'callout' = 'body') => {
    const newId = `box-${Date.now()}`;
    const count = boxes.length + 1;
    const maxZ = Math.max(0, ...boxes.map((b) => b.zIndex)) + 1;

    let newBox: PPTTextBox;

    if (preset === 'title') {
      newBox = {
        id: newId,
        x: 100 + (count * 20) % 200,
        y: 80 + (count * 20) % 200,
        width: 500,
        height: 100,
        text: 'New Section Title',
        style: {
          ...DEFAULT_STYLE,
          fontSize: 28,
          fontWeight: 'bold',
          textColor: '#0f172a',
          backgroundColor: '#ffffff',
          borderColor: '#2563eb',
          borderWidth: 2,
        },
        zIndex: maxZ,
      };
    } else if (preset === 'callout') {
      newBox = {
        id: newId,
        x: 120 + (count * 20) % 200,
        y: 120 + (count * 20) % 200,
        width: 320,
        height: 140,
        text: '💡 Important Note:\nDouble-click to start inline editing!',
        style: {
          ...DEFAULT_STYLE,
          fontSize: 16,
          textColor: '#854d0e',
          backgroundColor: '#fefce8',
          borderColor: '#eab308',
          borderWidth: 2,
          borderStyle: 'solid',
        },
        zIndex: maxZ,
      };
    } else {
      newBox = {
        id: newId,
        x: 150 + (count * 20) % 200,
        y: 150 + (count * 20) % 200,
        width: 300,
        height: 120,
        text: 'Click and drag to move shape.\nDrag corner handles to resize.',
        style: {
          ...DEFAULT_STYLE,
          fontSize: 16,
          textColor: '#334155',
          backgroundColor: '#ffffff',
          borderColor: '#94a3b8',
          borderWidth: 1.5,
        },
        zIndex: maxZ,
      };
    }

    setBoxes((prev) => [...prev, newBox]);
    setSelectedId(newId);
  };

  const handleUpdateBox = useCallback((id: string, updates: Partial<PPTTextBox>) => {
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const handleUpdateStyle = useCallback((id: string, styleUpdates: Partial<TextBoxStyle>) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, style: { ...b.style, ...styleUpdates } } : b))
    );
  }, []);

  const handleDuplicate = (id: string) => {
    const target = boxes.find((b) => b.id === id);
    if (!target) return;
    const maxZ = Math.max(0, ...boxes.map((b) => b.zIndex)) + 1;
    const clone: PPTTextBox = {
      ...target,
      id: `box-${Date.now()}`,
      x: target.x + 30,
      y: target.y + 30,
      zIndex: maxZ,
      style: { ...target.style },
    };
    setBoxes((prev) => [...prev, clone]);
    setSelectedId(clone.id);
  };

  const handleDelete = (id: string) => {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleToggleLock = (id: string) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isLocked: !b.isLocked } : b))
    );
  };

  const handleBringForward = (id: string) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, zIndex: b.zIndex + 1 } : b))
    );
  };

  const handleSendBackward = (id: string) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, zIndex: Math.max(1, b.zIndex - 1) } : b))
    );
  };

  const handleReset = () => {
    setBoxes(SAMPLE_TEXTBOXES);
    setSelectedId('box-title-1');
    setEditingId(null);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(boxes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ppt-textbox-shapes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Playground Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              PPT Text Box Shape Studio
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Add Text Box Presets */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAddBox('title')}
              className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
            >
              <Type className="h-3.5 w-3.5" />
              <span>Add Title</span>
            </button>
            <button
              onClick={() => handleAddBox('body')}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Text Box</span>
            </button>
            <button
              onClick={() => handleAddBox('callout')}
              className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Add Callout</span>
            </button>
          </div>
        </div>

        {/* Right side controls: Grid, Snapping, FPS counter */}
        <div className="flex items-center gap-3">
          {/* Toggle Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              showGrid
                ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>

          {/* Toggle Snapping */}
          <button
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              snapEnabled
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Smart Guides ({snapEnabled ? 'ON' : 'OFF'})</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* FPS & Performance Metric */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono dark:border-slate-800 dark:bg-slate-900">
            <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{fps} FPS</span>
            <span className="text-slate-400">({frameTimeMs}ms)</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Export & Reset */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="Export JSON State"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="Reset Canvas"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Slide Canvas Workspace Area */}
      <div className="relative flex flex-1 items-center justify-center overflow-auto p-8 bg-slate-200/70 dark:bg-slate-950">
        {/* PPT 16:9 Slide Canvas Frame */}
        <div
          className={`relative rounded-xl border border-slate-300 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 ${
            showGrid ? 'bg-grid-pattern' : ''
          }`}
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            backgroundImage: showGrid
              ? 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)'
              : 'none',
            backgroundSize: '20px 20px',
          }}
          onPointerDown={(e) => {
            // Deselect when clicking empty background
            if (e.target === e.currentTarget) {
              setSelectedId(null);
              setEditingId(null);
            }
          }}
        >
          {/* Render Text Boxes */}
          {boxes.map((box) => (
            <PPTTextBoxComponent
              key={box.id}
              box={box}
              otherBoxes={boxes.filter((b) => b.id !== box.id)}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              isSelected={selectedId === box.id}
              isEditing={editingId === box.id}
              onSelect={(id) => {
                setSelectedId(id);
              }}
              onStartEditing={(id) => {
                setSelectedId(id);
                setEditingId(id);
              }}
              onDoneEditing={(id, text) => {
                setEditingId(null);
                handleUpdateBox(id, { text });
              }}
              onUpdateBox={handleUpdateBox}
              onUpdateStyle={handleUpdateStyle}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onToggleLock={handleToggleLock}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
            />
          ))}

          {/* Quick Info Overlay */}
          <div className="pointer-events-none absolute bottom-3 right-4 rounded-md bg-slate-900/60 px-2.5 py-1 text-[11px] font-mono text-slate-200 backdrop-blur-sm">
            Canvas 1000 x 600 • {boxes.length} Shapes • GPU Hardware Acceleration
          </div>
        </div>
      </div>
    </div>
  );
};
