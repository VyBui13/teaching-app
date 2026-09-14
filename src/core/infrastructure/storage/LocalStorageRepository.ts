import type { IStorageRepository } from './IStorageRepository';

export class LocalStorageRepository<T> implements IStorageRepository<T> {
  private prefix: string;

  constructor(prefix = 'teach_app_') {
    this.prefix = prefix;
  }

  async save(key: string, data: T): Promise<void> {
    try {
      const fullKey = `${this.prefix}${key}`;
      const jsonStr = JSON.stringify(data);
      localStorage.setItem(fullKey, jsonStr);
    } catch (err) {
      console.warn(`[LocalStorageRepository] Quota exceeded or error saving key '${key}':`, err);
    }
  }

  async load(key: string): Promise<T | null> {
    try {
      const fullKey = `${this.prefix}${key}`;
      const raw = localStorage.getItem(fullKey);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[LocalStorageRepository] Error loading key '${key}':`, err);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = `${this.prefix}${key}`;
      localStorage.removeItem(fullKey);
    } catch (err) {
      console.error(`[LocalStorageRepository] Error removing key '${key}':`, err);
    }
  }

  async clear(): Promise<void> {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(this.prefix)) {
          localStorage.removeItem(k);
        }
      });
    } catch (err) {
      console.error(`[LocalStorageRepository] Error clearing storage:`, err);
    }
  }
}
