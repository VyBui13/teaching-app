import React, { useState, useEffect, useCallback } from 'react';
import { useTeachingContext } from '../context/TeachingContext';
import { DualZoneImportArea } from '../features/document-viewer/ui/DualZoneImportArea';
import { ThumbnailSidebar } from '../features/document-viewer/ui/ThumbnailSidebar';
import { DocumentStage } from '../features/document-viewer/ui/DocumentStage';
import { ToolPropertyBar } from '../features/annotation-canvas/ui/ToolPropertyBar';
import { ProcessingLoader } from '../components/ui/ProcessingLoader';

import { AppHeader } from '../components/layout/AppHeader';
import { SessionExportModal } from '../features/lesson-session/ui/SessionExportModal';
import { StudentPickerModal } from '../features/teaching-utilities/ui/StudentPickerModal';
import { LessonTimerModal } from '../features/teaching-utilities/ui/LessonTimerModal';
import { BlackboardOverlay } from '../features/teaching-utilities/ui/BlackboardOverlay';

import { AnnotationEntity } from '../features/annotation-canvas/domain/AnnotationEntity';
import type { ToolSettings } from '../types/annotation';

export const WorkspacePage: React.FC = () => {
  const {
    session,
    setSession,
    viewMode,
    autoSaveSession,
    importDocument,
    importSession,
  } = useTeachingContext();

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Left Slide Sidebar closed by default!
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Tool settings state
  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    activeTool: 'pencil',
    strokeColor: '#3b82f6',
    fillColor: 'transparent',
    strokeWidth: 4,
    fontSize: 18,
    opacity: 1,
  });

  // Undo/Redo stack for drawing
  const [historyStack, setHistoryStack] = useState<Record<number, AnnotationEntity[][]>>({});
  const [redoStack, setRedoStack] = useState<Record<number, AnnotationEntity[][]>>({});

  // Selected Annotation & Text Editing State
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationEntity | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Modals visibility state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Handle adding new annotation
  const handleAddAnnotation = (ann: AnnotationEntity) => {
    if (!session) return;
    const pageIdx = ann.pageIndex;
    const currentList = session.annotations[pageIdx] || [];
    const newList = [...currentList, ann];

    setHistoryStack((prev) => ({
      ...prev,
      [pageIdx]: [...(prev[pageIdx] || []), currentList],
    }));
    setRedoStack((prev) => ({ ...prev, [pageIdx]: [] }));

    session.setAnnotationsForPage(pageIdx, newList);
    const updated = session.clone();
    setSession(updated);
    autoSaveSession(updated);
  };

  // Handle selecting an annotation entity on canvas
  const handleSelectAnnotation = useCallback((ann: AnnotationEntity | null) => {
    setSelectedAnnotation(ann);
    if (ann && ['rectangle', 'circle', 'arrow', 'line'].includes(ann.type)) {
      setToolSettings((prev) => ({
        ...prev,
        selectedShapeType: ann.type as any,
      }));
    }
  }, []);

  // Handle updating existing annotation (Moving or re-styling)
  const handleUpdateAnnotation = useCallback(
    (updatedAnn: AnnotationEntity) => {
      if (!session) return;
      const pageIdx = updatedAnn.pageIndex;
      const currentList = session.annotations[pageIdx] || [];
      const newList = currentList.map((a) => (a.id === updatedAnn.id ? updatedAnn : a));

      session.setAnnotationsForPage(pageIdx, newList);
      const updated = session.clone();
      setSession(updated);
      setSelectedAnnotation(updatedAnn);
      autoSaveSession(updated);
    },
    [session, setSession, autoSaveSession]
  );

  // Handle deleting specific annotation (Eraser)
  const handleDeleteAnnotation = useCallback(
    (annotationId: string) => {
      if (!session) return;
      const currentList = session.annotations[currentPageIndex] || [];
      const newList = currentList.filter((a) => a.id !== annotationId);

      if (newList.length !== currentList.length) {
        setHistoryStack((prev) => ({
          ...prev,
          [currentPageIndex]: [...(prev[currentPageIndex] || []), currentList],
        }));

        session.setAnnotationsForPage(currentPageIndex, newList);
        const updated = session.clone();
        setSession(updated);
        autoSaveSession(updated);
      }
    },
    [session, currentPageIndex, setSession, autoSaveSession]
  );

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (!session) return;
    const history = historyStack[currentPageIndex] || [];
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const currentList = session.annotations[currentPageIndex] || [];

    setRedoStack((prev) => ({
      ...prev,
      [currentPageIndex]: [...(prev[currentPageIndex] || []), currentList],
    }));
    setHistoryStack((prev) => ({ ...prev, [currentPageIndex]: newHistory }));

    session.setAnnotationsForPage(currentPageIndex, previousState);
    const updated = session.clone();
    setSession(updated);
    autoSaveSession(updated);
  }, [session, historyStack, currentPageIndex, setSession, autoSaveSession]);

  // Handle Redo
  const handleRedo = useCallback(() => {
    if (!session) return;
    const redo = redoStack[currentPageIndex] || [];
    if (redo.length === 0) return;

    const nextState = redo[redo.length - 1];
    const newRedo = redo.slice(0, -1);
    const currentList = session.annotations[currentPageIndex] || [];

    setHistoryStack((prev) => ({
      ...prev,
      [currentPageIndex]: [...(prev[currentPageIndex] || []), currentList],
    }));
    setRedoStack((prev) => ({ ...prev, [currentPageIndex]: newRedo }));

    session.setAnnotationsForPage(currentPageIndex, nextState);
    const updated = session.clone();
    setSession(updated);
    autoSaveSession(updated);
  }, [session, redoStack, currentPageIndex, setSession, autoSaveSession]);

  // Handle clear all page annotations
  const handleClearPage = useCallback(() => {
    if (!session) return;
    const currentList = session.annotations[currentPageIndex] || [];
    if (currentList.length === 0) return;

    setHistoryStack((prev) => ({
      ...prev,
      [currentPageIndex]: [...(prev[currentPageIndex] || []), currentList],
    }));

    session.setAnnotationsForPage(currentPageIndex, []);
    const updated = session.clone();
    setSession(updated);
    autoSaveSession(updated);
  }, [session, currentPageIndex, setSession, autoSaveSession]);

  // Keyboard Shortcuts / Macros Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut keys when typing inside input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotation) {
        e.preventDefault();
        handleDeleteAnnotation(selectedAnnotation.id);
        setSelectedAnnotation(null);
        return;
      }

      if (ctrlOrCmd && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
      } else if (ctrlOrCmd && (e.key === 'y' || e.key === 'Y' || e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        handleRedo();
      } else if (ctrlOrCmd && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setIsExportModalOpen(true);
      } else if (ctrlOrCmd && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        handleClearPage();
      } else if (!ctrlOrCmd) {
        if (e.key === 'b' || e.key === 'B') {
          setSelectedAnnotation(null);
          setToolSettings((prev) => ({ ...prev, activeTool: 'pencil' }));
        } else if (e.key === 't' || e.key === 'T') {
          setSelectedAnnotation(null);
          setToolSettings((prev) => ({ ...prev, activeTool: 'text' }));
        } else if (e.key === 'r' || e.key === 'R') {
          setSelectedAnnotation(null);
          setToolSettings((prev) => ({ ...prev, activeTool: 'rectangle' }));
        } else if (e.key === 'c' || e.key === 'C') {
          setSelectedAnnotation(null);
          setToolSettings((prev) => ({ ...prev, activeTool: 'circle' }));
        } else if (e.key === 'e' || e.key === 'E') {
          setSelectedAnnotation(null);
          setToolSettings((prev) => ({ ...prev, activeTool: 'eraser' }));
        } else if (e.key === 'v' || e.key === 'V' || e.key === 'Escape') {
          setSelectedAnnotation(null);
          setToolSettings((prev) => ({ ...prev, activeTool: 'select' }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleClearPage, handleDeleteAnnotation, selectedAnnotation]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans select-none transition-colors">
      {/* Processing Loader Overlay */}
      <ProcessingLoader isLoading={isProcessing} message="Đang xử lý bài giảng và tạo slide..." />

      {/* App Header */}
      <AppHeader
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenStudentPicker={() => setIsStudentPickerOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
      />

      {/* STATE 1: Pre-Upload Dual Zone Area (Default if no session) */}
      {!session ? (
        <DualZoneImportArea
          onDocumentImported={(doc) => {
            setIsProcessing(true);
            setTimeout(() => {
              importDocument(doc);
              setCurrentPageIndex(0);
              setIsProcessing(false);
            }, 300);
          }}
          onSessionImported={(impSess) => {
            setIsProcessing(true);
            setTimeout(() => {
              importSession(impSess);
              setCurrentPageIndex(0);
              setIsProcessing(false);
            }, 300);
          }}
        />
      ) : (
        /* STATE 2: Active Lesson (Slide Presentation Mode or Whiteboard Mode) */
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {viewMode === 'whiteboard' ? (
            /* Fullscreen Interactive Whiteboard Mode */
            <BlackboardOverlay isOpen={true} onClose={() => {}} />
          ) : (
            /* Slide Viewer Mode */
            <>
              {/* Unified Top Property & Drawing Toolbar */}
              <ToolPropertyBar
                settings={toolSettings}
                onChangeSettings={(newS) => setToolSettings((prev) => ({ ...prev, ...newS }))}
                onClearPage={handleClearPage}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={(historyStack[currentPageIndex] || []).length > 0}
                canRedo={(redoStack[currentPageIndex] || []).length > 0}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                selectedAnnotation={selectedAnnotation}
                onUnselectAnnotation={() => setSelectedAnnotation(null)}
                onUpdateSelectedAnnotation={handleUpdateAnnotation}
                onDeleteSelectedAnnotation={() => {
                  if (selectedAnnotation) {
                    handleDeleteAnnotation(selectedAnnotation.id);
                    setSelectedAnnotation(null);
                  }
                }}
                onEditSelectedText={() => {
                  if (selectedAnnotation && selectedAnnotation.type === 'text') {
                    setEditingTextId(selectedAnnotation.id);
                  }
                }}
              />

              {/* Main Presentation Stage & Left Collapsible Slide Sidebar */}
              <div className="flex-1 flex overflow-hidden relative">
                <ThumbnailSidebar
                  isOpen={isSidebarOpen}
                  document={session.document}
                  currentPageIndex={currentPageIndex}
                  onSelectPage={(idx) => setCurrentPageIndex(idx)}
                />

                <DocumentStage
                  document={session.document}
                  currentPageIndex={currentPageIndex}
                  annotations={session.annotations}
                  toolSettings={toolSettings}
                  selectedAnnotation={selectedAnnotation}
                  onAddAnnotation={handleAddAnnotation}
                  onUpdateAnnotation={handleUpdateAnnotation}
                  onDeleteAnnotation={handleDeleteAnnotation}
                  onSelectAnnotation={handleSelectAnnotation}
                  editingTextId={editingTextId}
                  onDoneEditingText={() => setEditingTextId(null)}
                  onSwitchTool={(tool) => setToolSettings((prev) => ({ ...prev, activeTool: tool }))}
                  onOpenImportModal={() => {}}
                  onSelectPage={(idx) => setCurrentPageIndex(idx)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Teaching Tool Modals */}
      {session && (
        <>
          <SessionExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            session={session}
          />

          <StudentPickerModal
            isOpen={isStudentPickerOpen}
            onClose={() => setIsStudentPickerOpen(false)}
            students={session.studentList}
            onUpdateStudents={(list) => {
              session.studentList = list;
              const updated = session.clone();
              setSession(updated);
              autoSaveSession(updated);
            }}
          />

          <LessonTimerModal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
        </>
      )}
    </div>
  );
};
