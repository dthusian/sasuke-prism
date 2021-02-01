// A set of utility functions for dealing with items and players

import { CachedDatabase } from "../lib/db";
import { ItemV1 } from "../lib/types";
import { ItemType } from "./item";

export async function addItemToPlayer(db: CachedDatabase, playerId: string, item: ItemType, qty = 1): Promise<void> {
  const player = await db.getEntry("players", playerId);
  const index = player.inventory.findIndex((v: ItemV1) => v.id === item.id);
  if(index === -1) {
    const newInventory = Array.from(player.inventory);
    newInventory.push({ id: item.id, qty: qty, extra: null });
    db.updateEntry("players", playerId, {
      $set: { "inventory": newInventory }
    });
  } else {
    const newInventory = Array.from(player.inventory);
    newInventory[index].qty += qty;
    db.updateEntry("players", playerId, {
      $set: { "inventory": newInventory }
    });
  }
}

export async function listItems(db: CachedDatabase, playerId: string): Promise<ItemV1[]> {
  return (await db.getEntry("players", playerId)).inventory;
}