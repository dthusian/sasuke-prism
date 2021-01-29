import { Db, MongoClient, Collection, FilterQuery, UpdateQuery, ObjectID } from "mongodb";
import { Mutex } from "./mutex";

type DictOf<T> = { [key: string]: T };

type CollectionName = "guilds" | "players";

export type DBEntry = {
  _id: string,
  version: number | undefined
}

export type PlayerDBEntry = {
  _id: string,
  version: 1,
  stats: {
    level: number,
    xp: number
  },
  timers: { [x: string]: number }
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

function sanitizeGuildEntry(entry: DBEntry, id: string): GuildDBEntry {
  const newent: GuildDBEntry = {
    _id: id,
    version: 1,
    prefix: "+-"
  };
  if(!entry) return newent;
  switch(entry.version) {
    case 1: {
      return entry as GuildDBEntry; // Current version
    }
    default: {
      throw new Error("Unknown data format");
    }
  }
}

function sanitizePlayerEntry(entry: DBEntry, id: string): PlayerDBEntry {
  const newent: PlayerDBEntry = {
    _id: id,
    version: 1,
    stats: {
      level: 1,
      xp: 0
    },
    timers: {}
  };
  if(!entry) return newent;
  switch(entry.version) {
    case 1: {
      return entry as PlayerDBEntry; // Current version
    }
    default: {
      throw new Error("Unknown data format");
    }
  }
}

const sanitizerFunctions = {
  "guilds": sanitizeGuildEntry,
  "players": sanitizePlayerEntry
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
  
  getEntry(colName: "guilds", id: string): Promise<GuildDBEntry>;
  getEntry(colName: "players", id: string): Promise<PlayerDBEntry>;

  async getEntry(colName: CollectionName, id: string): Promise<unknown> {
    if(!this.collections[colName]) throw new Error(`Collection ${colName} not loaded`);
    const mutex = this.mutex[colName];
    const collec = this.collections[colName] as Collection<DictOf<unknown>>;
    const cache = this.cache[colName] as { [ _id: string ]: unknown };
    if(cache[id]) {
      if(mutex.ac) {
        await mutex.acquire();
        mutex.release();
      }
      return this.cache[colName][id] as unknown;
    }
    let entry = (await collec.findOne({ _id: id } as FilterQuery<unknown>)) as DBEntry;
    if(!entry) {
      entry = sanitizerFunctions[colName](entry, id);
      await collec.insertOne(entry as unknown as { _id: ObjectID });
      cache[id] = entry;
      return entry;
    } else {
      entry = sanitizerFunctions[colName](entry, id);
    }
    this.cache[colName][id] = entry;
    return entry;
  }

  updateEntry(colName: "guilds", id: string, updoc: UpdateQuery<GuildDBEntry>): Promise<void>;
  updateEntry(colName: "players", id: string, updoc: UpdateQuery<PlayerDBEntry>): Promise<void>;

  async updateEntry(colName: CollectionName, id: string, updoc: UpdateQuery<unknown>): Promise<void> { 
    const mutex = this.mutex[colName];
    await mutex.acquire();
    const collec = this.collections[colName];
    await collec.updateOne({ _id: id } as FilterQuery<unknown>, updoc);
    this.cache[colName][id] = void 0;
    mutex.release();
  }

  async clearCache(colName: CollectionName): Promise<void> {
    await this.mutex[colName].acquire();
    this.cache[colName] = {};
    this.mutex[colName].release();
  }
}