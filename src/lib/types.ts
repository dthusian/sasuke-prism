import { IDatabaseObjectConverter } from "./db";

export type DictOf<T> = { [key: string]: T };

export type GuildData = {
  version: number,
  prefix: string
}

export class GuildDataCvtr implements IDatabaseObjectConverter<GuildData> {
  fromJSON(json: unknown): GuildData {
    if(typeof json !== "object") throw new TypeError("Invalid Data");x
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = json as { [x: string]: any };
    if(typeof obj["version"] !== "number") throw new TypeError("Invalid Data");
    const version = obj["version"];
    switch(version) {
      case 1: {
        return obj as GuildData;
      }
      default: {
        throw new Error("Unknown Data Format");
      }
    }
  }
  toJSON(obj: GuildData): unknown {
    throw new Error("Method not implemented.");
  }
  newObject(): GuildData {
    throw new Error("Method not implemented.");
  }
}

export type DBEntry = {
  _id: string,
  version: number | undefined
}

export type ItemSlot = "armor" | "boots" | "primaryHand" | "secondaryHand" | "offhandLeft" | "offhandRight";

export type ItemV1 = {
  id: string,
  qty: number,
  extra: unknown
};

export type PlayerDBEntryV2 = {
  _id: string,
  version: 2,
  stats: {
    level: number,
    xp: number
  },
  timers: { [x: string]: number },
  loadout: { [x: string]: ItemV1 }
  inventory: ItemV1[]
};

export type PlayerDBEntryV1 = {
  _id: string,
  version: 1,
  stats: {
    level: number,
    xp: number
  },
  timers: { [x: string]: number }
};

export type GuildDBEntryV1 = {
  _id: string,
  version: 1,
  prefix: string
};