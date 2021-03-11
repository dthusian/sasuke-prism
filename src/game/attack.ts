import { PlayerData } from "../lib/types";
import { ToolData, ToolJSON } from "./item";
import { addXpToPlayer } from "./util";

export function attackPlayer(target: PlayerData, sender: PlayerData, tooltyp: ToolJSON, tool: ToolData): { damage: number, xp: number, dead: boolean } {
  const damage = tooltyp.stats.atk + tool.iv.atk;
  const xp = Math.floor(damage / 10);
  target.stats.hp -= damage;
  target.stats.hp = Math.max(target.stats.hp, 0);
  addXpToPlayer(sender, xp);
  return {
    damage: damage,
    xp: xp,
    dead: target.stats.hp === 0
  };
}