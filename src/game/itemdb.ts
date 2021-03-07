// A set of utility functions for dealing with items and players

import { PagedDatabase } from "../lib/db";
import { getPlayerFieldId, PlayerData } from "../lib/types";
import { MaterialData } from "./item";

export async function addMaterialToPlayer(db: PagedDatabase<PlayerData>, guildId: string, playerId: string, itemId: string, qty = 1): Promise<void> {
  const inventory = (await db.getEntry(getPlayerFieldId(guildId, playerId))).materials;
  const idx = (inventory.find(v => v.id === itemId));
  if(typeof idx === "number" && idx !== -1) {
    inventory[idx].amount += qty;
  }
}

export async function listPlayerMaterials(db: PagedDatabase<PlayerData>, guildId: string, playerId: string): Promise<MaterialData[]> {
  const inventory = (await db.getEntry(getPlayerFieldId(guildId, playerId))).materials;
  return inventory;
}

export async function fixupPlayerData(db: PagedDatabase<PlayerData>, guildId: string, playerId: string): Promise<void> {
  const pl = await db.getEntry(getPlayerFieldId(guildId, playerId));
  pl.materials = pl.materials.filter(v => v.amount);
}