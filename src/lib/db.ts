import { Db, MongoClient, Collection, FilterQuery, UpdateQuery, ObjectID } from "mongodb";
import { Mutex } from "./mutex";
import { TemporaryStorage } from "./temporary";
import { DBEntry, DictOf, GuildDBEntryV1, PlayerDBEntryV2 } from "./types";

type CollectionName = "guilds" | "players";

export type DBConfig = {
  userName: string,
  host: string,
  dbName: string,
  authType: string
};

function sanitizeGuildEntry(entry: DBEntry, id: string): GuildDBEntryV1 {
  const newent: GuildDBEntryV1 = {
    _id: id,
    version: 1,
    prefix: "+-"
  };
  if(!entry) return newent;
  switch(entry.version) {
    case 1: {
      return entry as GuildDBEntryV1; // Current version
    }
    default: {
      throw new Error("Unknown data format");
    }
  }
}

function sanitizePlayerEntry(entry: DBEntry, id: string): PlayerDBEntryV2 {
  const newent: PlayerDBEntryV2 = {
    _id: id,
    version: 2,
    stats: {
      level: 1,
      xp: 0
    },
    timers: {},
    loadout: {},
    inventory: []
  };
  if(!entry) return newent;
  switch(entry.version) {
    case 2: {
      return entry as PlayerDBEntryV2; // Current version
    }
    case 1: {
      const ret = entry as PlayerDBEntryV2;
      ret.inventory = [];
      return ret;
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
  
  getEntry(colName: "guilds", id: string): Promise<GuildDBEntryV1>;
  getEntry(colName: "players", id: string): Promise<PlayerDBEntryV2>;

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

  updateEntry(colName: "guilds", id: string, updoc: UpdateQuery<GuildDBEntryV1>): Promise<void>;
  updateEntry(colName: "players", id: string, updoc: UpdateQuery<PlayerDBEntryV2>): Promise<void>;

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

export interface IDatabaseObjectConverter<T> {
  fromJSON(json: unknown): T;
  toJSON(obj: T): unknown;
  newObject(): T;
}

export class PagedDatabase<T> {
  cache: TemporaryStorage<T>;
  collection: Collection;
  converter: IDatabaseObjectConverter<T>;
  timeout: number;

  constructor(converter: IDatabaseObjectConverter<T>, coll: Collection) {
    this.converter = converter;
    this.cache = new TemporaryStorage<T>();
  }

  async getEntry(id: string): Promise<T> {
    const maybeEntry = this.cache.getEntry(id);
    if(maybeEntry) {
      return maybeEntry;
    }
    const fromDb = await this.collection.findOne({ _id: id });
    let obj;
    if(!fromDb) {
      obj = this.converter.newObject();
    } else {
      obj = this.converter.fromJSON(fromDb);
    }
    this.cache.addEntry(id, obj, this.timeout);
    this.cache.setFlushCallback(id, async (id: string, object: T) => {
      await this.flushEntry(id);
    });
    return obj;
  }

  async flushEntry(id: string): Promise<void> {
    const entry = this.cache.getEntry(id);
    if(!entry) return;
    delete this.cache.entries[id];
    // eslint-disable-next-line @typescript-eslint/ban-types
    await this.collection.findOneAndReplace({ _id: id }, this.converter.toJSON(entry) as object);
  }

  async flushAll(): Promise<void> {
    const keys = Object.keys(this.cache);
    for(let i = 0; i < keys.length; i++) {
      this.flushEntry(keys[i]);
    }
  }

  async purgeEntry(id: string): Promise<void> {
    delete this.cache.entries[id];
    await this.collection.findOneAndDelete({ _id: id });
  }
}

export class Database {
  client: MongoClient;
  db: Db;
  config: DBConfig;

  constructor(config: DBConfig, token: string) {
    this.config = config;
    this.client = new MongoClient(
      `mongodb://${encodeURIComponent(config.userName)}:${encodeURIComponent(token)}@${config.host}/?authMechanism=${config.authType}`, {
        authSource: config.dbName,
        useUnifiedTopology: true
      });
  }

  async load(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.config.dbName);
  }

  async loadDataset<T>(id: string, cvt: IDatabaseObjectConverter<T>): Promise<PagedDatabase<T>> {
    return new PagedDatabase<T>(cvt, await this.db.collection(id));
  }
}