// A set of utility functions for dealing with items and players

import { PagedDatabase } from "../lib/db";
import { getPlayerFieldId, PlayerData } from "../lib/types";
import { MaterialData, ToolData } from "./item";

export function mergeTools(a: ToolData, b: ToolData): ToolData {
  const data: ToolData = {
    id: a.id,
    merge: a.merge + b.merge,
    rarity: Math.max(a.rarity, b.rarity)
  };
  return data;
}

export async function addMaterialToPlayer(db: PagedDatabase<PlayerData>, guildId: string, playerId: string, itemId: string, qty = 1): Promise<void> {
  const inventory = (await db.getEntry(getPlayerFieldId(guildId, playerId))).materials;
  const idx = (inventory.find(v => v.id === itemId));
  if(idx === undefined) {
    const mdat: MaterialData = {
      id: itemId,
      amount: qty
    }
    inventory.push(mdat);
  }
  if(typeof idx === "number" && idx !== -1) {
    inventory[idx].amount += qty;
  }
}

export async function addToolToPlayer(db: PagedDatabase<PlayerData>, guildId: string, playerId: string, tool: ToolData): Promise<void> {
  const inventory = (await db.getEntry(getPlayerFieldId(guildId, playerId))).tools;
  const idx = inventory.findIndex(v => v.id === tool.id);
  if(idx === -1) {
    inventory.push(tool);
  } else {
    inventory[idx] = mergeTools(inventory[idx], tool);
  }
}

export async function listPlayerMaterials(db: PagedDatabase<PlayerData>, guildId: string, playerId: string): Promise<MaterialData[]> {
  const inventory = await db.getEntry(getPlayerFieldId(guildId, playerId));
  return inventory.materials;
}

export async function listPlayerTools(db: PagedDatabase<PlayerData>, guildId: string, playerId: string): Promise<ToolData[]> {
  const inventory = await db.getEntry(getPlayerFieldId(guildId, playerId));
  return inventory.tools;
}

export async function findPlayerTool(db: PagedDatabase<PlayerData>, guildId: string, playerId: string, toolId: string): Promise<ToolData | undefined> {
  const inventory = await db.getEntry(getPlayerFieldId(guildId, playerId));
  const data = inventory.tools.find(v => v.id === toolId);
  return data;
}

export async function fixupPlayerData(db: PagedDatabase<PlayerData>, guildId: string, playerId: string): Promise<void> {
  const pl = await db.getEntry(getPlayerFieldId(guildId, playerId));
  pl.materials = pl.materials.filter(v => v.amount);
}