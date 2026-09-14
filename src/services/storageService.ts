import type { LessonSession } from '../types/lesson';

const STORAGE_KEY_CURRENT_SESSION = 'teaching_app_active_session_v1';
const STORAGE_KEY_STUDENT_LIST = 'teaching_app_students_v1';

export function saveSessionToLocalStorage(session: LessonSession): void {
  try {
    const serialized = JSON.stringify(session);
    localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, serialized);
  } catch (error) {
    console.warn('Failed to save active session to localStorage (might exceed quota):', error);
  }
}

export function loadSessionFromLocalStorage(): LessonSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as LessonSession;
  } catch (error) {
    console.error('Failed to parse session from localStorage:', error);
    return null;
  }
}

export function clearLocalStorageSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error);
  }
}

export function saveStudentsToLocalStorage(students: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENT_LIST, JSON.stringify(students));
  } catch (error) {
    console.error('Failed to save student list:', error);
  }
}

export function loadStudentsFromLocalStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_LIST);
    if (!raw) {
      return [
        'Nguyễn Văn An',
        'Trần Thị Bích',
        'Lê Hoàng Cường',
        'Phạm Minh Đức',
        'Hoàng Thị Giang',
        'Đỗ Hữu Hùng',
        'Vũ Hải Khánh',
        'Bùi Thị Linh',
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
