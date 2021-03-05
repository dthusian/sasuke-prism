// A set of utility functions for dealing with items and players

import { PagedDatabase } from "../lib/db";
import { PlayerData } from "../lib/types";

export async function addMaterialToPlayer(db: PagedDatabase<PlayerData>, playerId: string, itemId: string, qty = 1): Promise<void> {
  const inventory = (await db.getEntry(playerId)).materials;
  const idx = (inventory.find(v => v.id === itemId));
  if(typeof idx === "number" && idx !== -1) {
    inventory[idx].amount += qty;
  }
}