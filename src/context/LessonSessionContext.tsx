import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LessonSessionAggregate } from '../features/lesson-session/domain/LessonSessionAggregate';
import { SampleDocumentFactory } from '../features/document-viewer/infrastructure/SampleDocumentFactory';
import { LocalStorageRepository } from '../core/infrastructure/storage/LocalStorageRepository';
import { TeachFileSchema, type ExportedTeachFilePayload } from '../features/lesson-session/domain/TeachFileSchema';
import { DocumentAggregate } from '../features/document-viewer/domain/DocumentAggregate';

const storageRepo = new LocalStorageRepository<ExportedTeachFilePayload>('teach_app_');
const STORAGE_KEY_SESSION = 'active_session';

interface LessonSessionContextType {
  session: LessonSessionAggregate;
  setSession: React.Dispatch<React.SetStateAction<LessonSessionAggregate>>;
  autoSaveStatus: 'saved' | 'saving' | 'error';
  autoSaveSession: (session: LessonSessionAggregate) => Promise<void>;
  importDocument: (doc: DocumentAggregate) => void;
  importSession: (importedSession: LessonSessionAggregate) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
}

const LessonSessionContext = createContext<LessonSessionContextType | undefined>(undefined);

export const LessonSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LessonSessionAggregate>(() => {
    return LessonSessionAggregate.create({
      version: '1.0',
      sessionId: `session_${Date.now()}`,
      title: 'Bài Giảng Mẫu - AI Driven Design',
      createdAt: Date.now(),
      lastModifiedAt: Date.now(),
      document: SampleDocumentFactory.createSample(),
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
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    async function loadSavedSession() {
      const savedData = await storageRepo.load(STORAGE_KEY_SESSION);
      if (savedData) {
        try {
          const restored = TeachFileSchema.deserialize(savedData);
          setSession(restored);
        } catch (e) {
          console.warn('Failed to parse saved session, falling back to sample:', e);
        }
      }
    }
    loadSavedSession();
  }, []);

  // Auto-save session to LocalStorage on modifications
  const autoSaveSession = useCallback(async (currentSession: LessonSessionAggregate) => {
    setAutoSaveStatus('saving');
    try {
      const payload = TeachFileSchema.serialize(currentSession);
      await storageRepo.save(STORAGE_KEY_SESSION, payload);
      setAutoSaveStatus('saved');
    } catch {
      setAutoSaveStatus('error');
    }
  }, []);

  const importDocument = (doc: DocumentAggregate) => {
    session.setDocument(doc);
    session.title = doc.name;
    const updated = session.clone();
    setSession(updated);
    autoSaveSession(updated);
  };

  const importSession = (importedSession: LessonSessionAggregate) => {
    setSession(importedSession);
    autoSaveSession(importedSession);
  };

  return (
    <LessonSessionContext.Provider
      value={{
        session,
        setSession,
        autoSaveStatus,
        autoSaveSession,
        importDocument,
        importSession,
        isImportModalOpen,
        setIsImportModalOpen,
      }}
    >
      {children}
    </LessonSessionContext.Provider>
  );
};

export const useLessonSessionContext = () => {
  const context = useContext(LessonSessionContext);
  if (!context) {
    throw new Error('useLessonSessionContext must be used within a LessonSessionProvider');
  }
  return context;
};
