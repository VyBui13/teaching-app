import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LessonSessionAggregate } from '../features/lesson-session/domain/LessonSessionAggregate';
import { LocalStorageRepository } from '../core/infrastructure/storage/LocalStorageRepository';
import { TeachFileSchema, type ExportedTeachFilePayload } from '../features/lesson-session/domain/TeachFileSchema';
import { DocumentAggregate } from '../features/document-viewer/domain/DocumentAggregate';

const storageRepo = new LocalStorageRepository<ExportedTeachFilePayload>('teach_app_');
const STORAGE_KEY_SESSION = 'active_session';
const STORAGE_KEY_THEME = 'app_theme';

export type MainViewMode = 'slide' | 'whiteboard';

interface TeachingContextType {
  session: LessonSessionAggregate | null;
  setSession: React.Dispatch<React.SetStateAction<LessonSessionAggregate | null>>;
  viewMode: MainViewMode;
  setViewMode: (mode: MainViewMode) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  autoSaveStatus: 'saved' | 'saving' | 'error';
  autoSaveSession: (session: LessonSessionAggregate) => void;
  importDocument: (doc: DocumentAggregate) => void;
  importSession: (importedSession: LessonSessionAggregate) => void;
  clearActiveSession: () => void;
}

const TeachingContext = createContext<TeachingContextType | undefined>(undefined);

export const TeachingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LessonSessionAggregate | null>(null);
  const [viewMode, setViewMode] = useState<MainViewMode>('slide');
  
  // Default theme is LIGHT mode!
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved === 'dark' ? 'dark' : 'light';
  });
  
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Load saved session on initial mount if available
  useEffect(() => {
    async function loadSavedSession() {
      const savedData = await storageRepo.load(STORAGE_KEY_SESSION);
      if (savedData) {
        try {
          const restored = TeachFileSchema.deserialize(savedData);
          setSession(restored);
        } catch (e) {
          console.warn('Failed to parse saved session:', e);
        }
      }
    }
    loadSavedSession();
  }, []);

  // Sync theme class on <html> & <body>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDirtyRef = React.useRef<boolean>(false);

  // Mark session as dirty whenever session state changes
  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  // Fixed 15-second interval auto-save to LocalStorage if session has modifications
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isDirtyRef.current && session) {
        setAutoSaveStatus('saving');
        try {
          const payload = TeachFileSchema.serialize(session);
          await storageRepo.save(STORAGE_KEY_SESSION, payload);
          isDirtyRef.current = false;
          setAutoSaveStatus('saved');
        } catch {
          setAutoSaveStatus('error');
        }
      }
    }, 15000); // Fixed 15s

    return () => clearInterval(interval);
  }, [session]);

  const autoSaveSession = useCallback((_currentSession: LessonSessionAggregate) => {
    markDirty();
  }, [markDirty]);

  const importDocument = (doc: DocumentAggregate) => {
    const newSession = LessonSessionAggregate.create({
      version: '1.0',
      sessionId: `session_${Date.now()}`,
      title: doc.name,
      createdAt: Date.now(),
      lastModifiedAt: Date.now(),
      document: doc,
      annotations: {},
      teacherNotes: {},
      studentList: [
        'Nguyễn Văn An',
        'Trần Thị Bích',
        'Lê Hoàng Cường',
        'Phạm Minh Đức',
        'Hoàng Thị Giang',
        'Đỗ Hữu Hùng',
      ],
    });

    setSession(newSession);
    autoSaveSession(newSession);
    setViewMode('slide');
  };

  const importSession = (importedSession: LessonSessionAggregate) => {
    setSession(importedSession);
    autoSaveSession(importedSession);
    setViewMode('slide');
  };

  const clearActiveSession = () => {
    setSession(null);
    storageRepo.remove(STORAGE_KEY_SESSION);
  };

  return (
    <TeachingContext.Provider
      value={{
        session,
        setSession,
        viewMode,
        setViewMode,
        theme,
        toggleTheme,
        autoSaveStatus,
        autoSaveSession,
        importDocument,
        importSession,
        clearActiveSession,
      }}
    >
      {children}
    </TeachingContext.Provider>
  );
};

export const useTeachingContext = () => {
  const context = useContext(TeachingContext);
  if (!context) {
    throw new Error('useTeachingContext must be used within a TeachingProvider');
  }
  return context;
};
