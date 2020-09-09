import { MongoClient } from "mongodb";

type PlayerDBEntry = {
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

const CONNECTION_URI = `mongodb://${encodeURIComponent(USER_NAME)}:${encodeURIComponent(mongoToken)}@127.0.0.1:27017/?authMechanism=${AUTH_TYPE}`;

export class CachedDatabase {
  client: MongoClient;

  constructor() {
    this.client = new mongo.MongoClient(CONNECTION_URI, {
      authSource: "sasuke_prism",
      useUnifiedTopology: true
    });
  }

  getPlayer(uuid: string): PlayerDBEntry {
    
  }
}