import { Db, MongoClient, Collection, } from "mongodb";
import { TemporaryStorage } from "./temporary";

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
  cache: TemporaryStorage<T>;
  collection: Collection;
  converter: IDatabaseObjectConverter<T>;
  timeout: number;

  constructor(converter: IDatabaseObjectConverter<T>, coll: Collection) {
    this.converter = converter;
    this.cache = new TemporaryStorage<T>();
    this.collection = coll;
  }

  async getEntry(id: string): Promise<T> {
    const maybeEntry = this.cache.getEntry(id);
    if(maybeEntry) {
      this.cache.refreshEntry(id, this.timeout);
      return maybeEntry;
    }
    const fromDb = await this.collection.findOne({ _id: id });
    let obj;
    if(!fromDb) {
      obj = this.converter.newObject(id);
    } else {
      obj = this.converter.fromJSON(fromDb);
    }
    this.cache.addEntry(id, obj, this.timeout);
    this.cache.setFlushCallback(id, async (id: string) => {
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