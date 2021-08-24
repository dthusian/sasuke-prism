import { Database as SQLiteDatabase, RunResult } from "sqlite3";
import { Mutex } from "./mutex";
import { TemporaryStorage } from "./temporary";

function runSqlAsync(db: SQLiteDatabase, query: string, params: any[] = []): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err: Error | null) => {
      if(err) reject(err);
      resolve(this);
    });
  });
}

function getRowAsync(res: RunResult): Promise<object> {
  return new Promise((resolve, reject) => {
    res.get((err, row) => {
      if(err) reject(err);
      console.log(row);
      resolve(row.json);
    });
  });
}

export type DBConfig = {
  userName: string,
  host: string,
  dbName: string,
  authType: string
};

export interface IDatabaseObjectConverter<T> {
  fromJSON(json: unknown): T;
  toJSON(obj: T): unknown;
  newObject(id: string): T;
}

export class PagedDatabase<T> {
  db: SQLiteDatabase;
  cache: TemporaryStorage<T>;
  cacheMutex: Mutex;
  table: string;
  converter: IDatabaseObjectConverter<T>;
  timeout: number;

  constructor(converter: IDatabaseObjectConverter<T>, db: SQLiteDatabase, table: string) {
    this.db = db;
    this.cache = new TemporaryStorage<T>();
    this.cacheMutex = new Mutex();
    this.table = table;
    this.converter = converter;
  }

  async getEntry(id: string): Promise<T> {
    const maybeEntry = this.cache.getEntry(id);
    if(maybeEntry) {
      this.cache.refreshEntry(id, this.timeout);
      return maybeEntry;
    }
    const fromDb = await getRowAsync(await runSqlAsync(this.db, "SELECT json FROM ? WHERE id = ?", [this.table, id]));
    let obj;
    if(!fromDb) {
      obj = this.converter.newObject(id);
    } else {
      obj = this.converter.fromJSON(fromDb);
    }
    if(this.cacheMutex.ac) {
      await this.cacheMutex.acquire();
      this.cacheMutex.release();
    }
    this.cache.addEntry(id, obj, this.timeout);
    this.cache.setFlushCallback(id, async (id: string) => {
      await this.flushEntry(id);
    });
    return obj;
  }

  async flushEntry(id: string, acquire = true): Promise<void> {
    const entry = this.cache.getEntry(id);
    if(!entry) return;
    if(acquire) await this.cacheMutex.acquire();
    delete this.cache.entries[id];
    // eslint-disable-next-line @typescript-eslint/ban-types
    await runSqlAsync(this.db, "INSERT INTO ? (json) VALUES ? WHERE id = ?", [this.table, JSON.stringify(this.converter.toJSON(entry)), id]);
    if(acquire) this.cacheMutex.release();
  }

  async flushAll(): Promise<void> {
    await this.cacheMutex.acquire();
    const keys = Object.keys(this.cache);
    for(let i = 0; i < keys.length; i++) {
      this.flushEntry(keys[i], false);
    }
    this.cacheMutex.release();
  }

  async purgeEntry(id: string): Promise<void> {
    await this.cacheMutex.acquire();
    delete this.cache.entries[id];
    await runSqlAsync(this.db, "DELETE FROM ? WHERE id = ?", [this.table, id]);
    this.cacheMutex.release();
  }
}

export class Database {
  db: SQLiteDatabase;
  config: DBConfig;

  constructor(config: DBConfig, token: string) {
    this.config = config;
    
  }

  async load(): Promise<void> {
    this.db = new SQLiteDatabase("../data.sqlite");
    await (new Promise((resolve, reject) => {
      this.db.on("open", resolve);
      this.db.on("error", reject);
    }));
  }

  async loadDataset<T>(id: string, cvt: IDatabaseObjectConverter<T>): Promise<PagedDatabase<T>> {
    return new PagedDatabase<T>(cvt, this.db, id);
  }
}