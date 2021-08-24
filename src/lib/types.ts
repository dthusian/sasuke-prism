import { IDatabaseObjectConverter } from "./db";

export type DictOf<T> = { [key: string]: T };

export type GuildData = {
  _id: string,
  version: 1,
  prefix: string
}

export type PlayerData = {
  _id: string,
  version: 2,
  stats: {
    level: number,
    xp: number
  },
  timers: { [x: string]: number }
}

export class GuildDataCvtr implements IDatabaseObjectConverter<GuildData> {
  fromJSON(json: unknown): GuildData {
    if(typeof json !== "object") throw new TypeError("Invalid data");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = json as { [x: string]: any };
    if(typeof obj["version"] !== "number") throw new TypeError("Invalid data");
    const version = obj["version"];
    switch(version) {
      case 1: {
        return obj as GuildData;
      }
      default: {
        throw new Error("Unknown data format");
      }
    }
  }
  toJSON(obj: GuildData): unknown {
    return obj;
  }
  newObject(id: string): GuildData {
    return {
      _id: id,
      version: 1,
      prefix: "+-"
    }
  }
}

export class PlayerDataCvtr implements IDatabaseObjectConverter<PlayerData> {
  fromJSON(json: unknown): PlayerData {
    if(typeof json !== "object") throw new TypeError("Invalid data");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = json as { [x: string]: any };
    if(typeof obj["version"] !== "number") throw new TypeError("Invalid data");
    const version = obj["version"];
    switch(version) {
      case 2: {
        return obj as PlayerData;
      }
      case 1: {
        throw new Error("Not implemented");
      }
      default: {
        throw new Error("Unknown data format");
      }
    }
  }
  toJSON(obj: PlayerData): unknown {
    return obj;
  }
  newObject(id: string): PlayerData {
    return {
      _id: id,
      version: 2,
      stats: {
        level: 1,
        xp: 0
      },
      timers: {}
    };
  }
}

export type DBEntry = {
  _id: string,
  version: number | undefined
}

export function getPlayerFieldId(gid: string, pid: string): string {
  return `${gid}-${pid}`;
}