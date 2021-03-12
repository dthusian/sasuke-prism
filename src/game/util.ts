// A set of utility functions for dealing with items and players

import { PagedDatabase } from "../lib/db";
import { getPlayerFieldId, PlayerData } from "../lib/types";
import { ItemRegistry, MaterialData, ToolData } from "./item";
import { getReqdExp } from "./level";

export function mergeTools(a: ToolData, b: ToolData): ToolData {
  const data: ToolData = {
    id: a.id,
    merge: a.merge + b.merge,
    rarity: Math.max(a.rarity, b.rarity),
    iv: {
      atk: Math.max(a.iv.atk, b.iv.atk),
      spd: Math.max(a.iv.spd, b.iv.spd),
      cost: Math.max(a.iv.cost, b.iv.cost)
    }
  };
  return data;
}

export async function addMaterialToPlayer(pl: PlayerData, itemId: string, qty = 1): Promise<void> {
  const inventory = pl.materials;
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

export function newToolClean(items: ItemRegistry, id: string): ToolData {
  const dat: ToolData = {
    id: id,
    rarity: items.tools[id].allowedRarity.reduce((a, b) => Math.max(a, b)),
    merge: 1,
    iv: {
      atk: 0,
      spd: 0,
      cost: 0
    }
  };
  return dat;
}

export async function addToolToPlayer(pl: PlayerData, tool: ToolData): Promise<void> {
  const inventory = pl.tools;
  const idx = inventory.findIndex(v => v.id === tool.id);
  if(idx === -1) {
    inventory.push(tool);
  } else {
    inventory[idx] = mergeTools(inventory[idx], tool);
  }
}

export async function findPlayerTool(pl: PlayerData, toolId: string): Promise<ToolData | undefined> {
  const data = pl.tools.find(v => v.id === toolId);
  return data;
}

export async function fixupPlayerData(pl: PlayerData): Promise<void> {
  pl.materials = pl.materials.filter(v => v.amount);
}

export function addXpToPlayer(pl: PlayerData, amount: number): void {
  pl.stats.xp += amount;
  while(pl.stats.xp > getReqdExp(pl.stats.level)) {
    pl.stats.xp -= getReqdExp(pl.stats.level);
    pl.stats.level++;
  }
}