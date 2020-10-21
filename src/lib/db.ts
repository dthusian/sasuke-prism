import { Db, MongoClient, Collection } from "mongodb";

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
  guildCollection: Collection;
  config: DBConfig;

  constructor(config: DBConfig, token: string) {
    this.config = config;
    this.client = new MongoClient(
      `mongodb://${encodeURIComponent(config.userName)}:${encodeURIComponent(token)}@${config.host}/?authMechanism=${config.authType}`, {
        authSource: config.dbName,
        useUnifiedTopology: true
      });
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(this.config.dbName);
    this.guildCollection = this.db.collection("guilds");
  }

  async getGuild(id: string): Promise<GuildDBEntry> {
    var entry = await this.guildCollection.findOne({ _id: id });
    if(!entry) {
      entry = {
        _id: id,
        version: 1,
        prefix: "="
      };
      await this.guildCollection.insertOne(entry);
      return entry;
    }
    return entry;
  }
}