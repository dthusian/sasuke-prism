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
  mutex: boolean;
  guildCollection: Collection<GuildDBEntry>;
  guildCache: { [ _id: string ]: GuildDBEntry };
  playerCollection: Collection<PlayerDBEntry>;
  playerCache: { [ _id: string ]: PlayerDBEntry };
  config: DBConfig;

  constructor(config: DBConfig, token: string) {
    this.mutex = false;
    this.config = config;
    this.client = new MongoClient(
      `mongodb://${encodeURIComponent(config.userName)}:${encodeURIComponent(token)}@${config.host}/?authMechanism=${config.authType}`, {
        authSource: config.dbName,
        useUnifiedTopology: true
      });
    this.guildCache = {};
    this.playerCache = {};
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.config.dbName);
    this.guildCollection = await this.db.collection("guilds");
    this.playerCollection = await this.db.collection("players");
  }

  async getGuild(id: string): Promise<GuildDBEntry> {
    if(this.guildCache[id]) {
      return this.guildCache[id];
    }
    let entry = await this.guildCollection.findOne({ _id: id });
    if(!entry) {
      entry = {
        _id: id,
        version: 1,
        prefix: "prism "
      };
      await this.guildCollection.insertOne(entry);
      this.guildCache[id] = entry;
      return entry;
    }
    this.guildCache[id] = entry;
    return entry;
  }
}