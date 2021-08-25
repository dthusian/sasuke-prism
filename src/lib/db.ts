import { Database as SQLiteDatabase, RunResult, Statement } from "sqlite3";
import { Logger } from "./logger";
import { Mutex } from "./mutex";
import { TemporaryStorage } from "./temporary";

function runSqlAsync(query: Statement, params: any[] = []): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    query.run(params, function(err: Error | null) {
      if(err) reject(err);
      resolve(this);
    });
  });
}

function getRowAsync(query: Statement, params: any[] = []): Promise<object | undefined> {
  return new Promise((resolve, reject) => {
    query.get(params, (err, row) => {
      if(err) reject(err);
      if(!row) resolve(undefined);
      else {
        resolve(JSON.parse(row.json));
      }
    });
  });
}

export type DBConfig = {
  filepath: string
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
  statementGetPlayer: Statement;
  statementUpdatePlayer: Statement;
  statementNewPlayer: Statement;
  statementPurgePlayer: Statement;

  constructor(converter: IDatabaseObjectConverter<T>, db: SQLiteDatabase, table: string) {
    this.db = db;
    this.cache = new TemporaryStorage<T>();
    this.cacheMutex = new Mutex();
    this.table = table;
    this.converter = converter;
    // No SQLi here :blobcomfy:
    // Table names are hardcoded and never user-input
    this.statementGetPlayer = db.prepare(`SELECT json FROM ${table} WHERE id = ?`, err => {
      if(err) throw err;
    });
    this.statementNewPlayer = db.prepare(`INSERT INTO ${table} (id, json) VALUES (?, ?)`, err => {
      if(err) throw err;
    });
    this.statementUpdatePlayer = db.prepare(`UPDATE ${table} SET json = ? WHERE id = ?`, err => {
      if(err) throw err;
    })
    this.statementPurgePlayer = db.prepare(`DELETE FROM ${table} WHERE id = ?`, err => {
      if(err) throw err;
    });
  }

  async getEntry(id: string): Promise<T> {
    const maybeEntry = this.cache.getEntry(id);
    if(maybeEntry) {
      this.cache.refreshEntry(id, this.timeout);
      return maybeEntry;
    }
    const fromDb = await getRowAsync(this.statementGetPlayer, [id]);
    let obj;
    if(!fromDb) {
      obj = this.converter.newObject(id);
      try {
        await runSqlAsync(this.statementNewPlayer, [id, obj]);
      } catch(err) {
        if(!err.message.contains("UNIQUE constraint")) throw err;
      }
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
    await runSqlAsync(this.statementUpdatePlayer, [JSON.stringify(this.converter.toJSON(entry)), id]);
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
    await runSqlAsync(this.statementPurgePlayer, [id]);
    this.cacheMutex.release();
  }
}

export class Database {
  db: SQLiteDatabase;
  config: DBConfig;
  logs: Logger;

  constructor(logs: Logger, config: DBConfig) {
    this.logs = logs;
    this.config = config;
  }

  async load(): Promise<void> {
    await (new Promise<void>((resolve, reject) => {
      this.db = new SQLiteDatabase(this.config.filepath || "../data.sqlite", err => {
        if(err) reject(err);
      });
      let resolved = false;
      this.db.on("open", () => { resolved = true; resolve(); });
    }));
    this.db.on("error", err => {
      this.logs.logError("SQLite Error: " + err.message);
    });
  }

  async loadDataset<T>(id: string, cvt: IDatabaseObjectConverter<T>): Promise<PagedDatabase<T>> {
    return new PagedDatabase<T>(cvt, this.db, id);
  }
}