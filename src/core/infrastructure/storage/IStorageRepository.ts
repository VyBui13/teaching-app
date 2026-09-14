export interface IStorageRepository<T> {
  save(key: string, data: T): Promise<void>;
  load(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
