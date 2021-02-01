export type DictOf<T> = { [key: string]: T };

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