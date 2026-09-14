import type { Annotation } from './annotation';
import type { DocumentInfo } from './document';

export interface LessonSession {
  version: string; // e.g. "1.0"
  sessionId: string;
  title: string;
  subject?: string;
  createdAt: number;
  lastModifiedAt: number;
  document: DocumentInfo | null;
  annotations: Record<number, Annotation[]>; // pageIndex -> array of annotations
  teacherNotes: Record<number, string>; // pageIndex -> teacher notes
  aiGeneratedContent?: {
    quizzes?: Array<{ question: string; options: string[]; answerIndex: number }>;
    summary?: string;
    keyTerms?: string[];
  };
  studentList?: string[];
}

export interface SessionExportMetadata {
  fileFormat: 'TEACH_APP_V1';
  exportedAt: number;
  annotationCount: number;
  hasDocument: boolean;
}

export interface ExportedLessonFile {
  metadata: SessionExportMetadata;
  session: LessonSession;
}
