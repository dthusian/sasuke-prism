import { Db, MongoClient, Collection, OptionalId, FilterQuery, UpdateQuery } from "mongodb";
import { Mutex } from "./mutex";

export type PlayerDBEntry = {
  _id: string,
  version: 1,
  stats: {
    level: number,
    xp: number
  },
  timers: {
    lastGotPassives: number // Unix Timestamp
  }
};

export type GuildDBEntry = {
  _id: string,
  version: 1,
  prefix: string
};

export type DBConfig = {
  userName: string,
  host: string,
  dbName: string,
  authType: string
};

export class CachedDatabase {
  client: MongoClient;
  db: Db;
  mutex: { [ x: string ]: Mutex };
  collections: { [ x: string ]: Collection };
  cache: { [ x: string ]: { [_id: string ]: unknown }};
  config: DBConfig;

  constructor(config: DBConfig, token: string) {
    this.config = config;
    this.client = new MongoClient(
      `mongodb://${encodeURIComponent(config.userName)}:${encodeURIComponent(token)}@${config.host}/?authMechanism=${config.authType}`, {
        authSource: config.dbName,
        useUnifiedTopology: true
      });
    this.collections = {};
    this.cache = {};
    this.mutex = {};
  }

  async loadCollection(name: string): Promise<void> {
    this.collections[name] = await this.db.collection(name);
    this.cache[name] = {};
    this.mutex[name] = new Mutex();
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.config.dbName);
    await this.loadCollection("guilds");
    await this.loadCollection("players");
  }

  // Time to throw away type safety
  async getEntry<T>(colName: string, id: string): Promise<T> {
    if(!this.collections[colName]) throw new Error(`Collection ${colName} not loaded`);
    const mutex = this.mutex[colName];
    const collec = this.collections[colName] as Collection<T>;
    const cache = this.cache[colName] as { [ _id: string ]: T };
    if(cache[id]) {
      if(mutex.ac) {
        await mutex.acquire();
        mutex.release();
      }
      return this.cache[colName][id] as T;
    }
    let entry = (await collec.findOne({ _id: id } as FilterQuery<T>)) as unknown as T;
    if(!entry) {
      entry = {} as T;
      await collec.insertOne(entry as OptionalId<T>);
      cache[id] = entry;
      return entry;
    }
    this.cache[colName][id] = entry;
    return entry;
  }

  async updateEntry<T>(colName: string, id: string, updoc: UpdateQuery<T>): Promise<void> { 
    const mutex = this.mutex[colName];
    await mutex.acquire();
    const collec = this.collections[colName] as Collection<T>;
    await collec.updateOne({ _id: id } as FilterQuery<T>, updoc);
    this.cache[colName][id] = void 0;
    mutex.release();
  }

  async clearCache(colName: string): Promise<void> {
    await this.mutex[colName].acquire();
    this.cache[colName] = {};
    this.mutex[colName].release();
  }
}