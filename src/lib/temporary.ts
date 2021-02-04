export type FlushCallback<T> = (obj: T) => void;

// internal
class TempStorageEntry<T> {
  timer: ReturnType<typeof setTimeout>;
  callback: FlushCallback<T>;
  object: T;
  constructor(that: TemporaryStorage<T>, id: string, obj: T, ms: number) {
    this.timer = setTimeout((that2: TemporaryStorage<T>) => {
      that2.entries[id].callback(that2.entries[id].object);
      delete that2.entries[id];
    }, ms, that);
    this.object = obj;
  }
  refresh(that: TemporaryStorage<T>, id: string, ms: number): void {
    clearTimeout(this.timer);
    this.timer = setTimeout((that2: TemporaryStorage<T>) => {
      that2.entries[id].callback(that2.entries[id].object);
      delete that2.entries[id];
    }, ms, that);
  }
}

// For temporarily stored entries
// You can configure how long entries should last for
export class TemporaryStorage<T> {
  entries: { [id: string]: TempStorageEntry<T> };
  constructor() {
    this.entries = {};
  }
  addEntry(id: string, obj: T, ms: number): void {
    this.entries[id] = new TempStorageEntry<T>(this, id, obj, ms);
  }
  refreshEntry(id: string, ms: number): void {
    this.entries[id].refresh(this, id, ms);
  }
  setFlushCallback(id: string, cb: FlushCallback<T>): void {
    this.entries[id].callback = cb;
  }
  getEntry(id: string): T | null {
    if(this.entries[id]) {
      return this.entries[id].object;
    } else {
      return null;
    }
  }
}