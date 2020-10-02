import { MongoClient } from "mongodb";

export type PlayerDBEntry = {
  _id: string,
  version: 1,
  mana: {
    primal: number,
    crystal: number,
    power: number,
    void: number
  },
  stats: {
    level: number,
    xp: number
  },
  timers: {
    lastPlayedTypingGame: Date,
    lastGotPassives: Date,
    lastCastCharm: { [charm: string]: Date }
  }
};

export type DBConfig = {
  userName: string,
  host: string,
  dbName: string,
  authType: string
};

export class CachedDatabase {
  client: MongoClient;

  constructor(config: DBConfig, token: string) {
    this.client = new MongoClient(
      `mongodb://${encodeURIComponent(config.userName)}:${encodeURIComponent(token)}@${config.host}/?authMechanism=${config.authType}`, {
        authSource: config.dbName,
        useUnifiedTopology: true
      });
  }
}