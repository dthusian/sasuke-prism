export type DictOf<T> = { [key: string]: T };

export type DBEntry = {
  _id: string,
  version: number | undefined
}

export type ItemSlot = "armor" | "mainhand" | "offhand1" | "offhand2" | "offhand3" | "inv0" | "inv1" | "inv2" | "inv3" | "inv4" | "inv5" | "inv6" | "inv7";

export type ItemV1 = {
  item: string,
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
  inventory: { [x: string]: ItemV1 },
  interaction: string
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