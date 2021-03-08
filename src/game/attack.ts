import { PlayerData } from "../lib/types";
import { ToolData, ToolJSON } from "./item";
import { addXpToPlayer } from "./util";

export function attackPlayer(target: PlayerData, sender: PlayerData, tooltyp: ToolJSON, tool: ToolData) {
  const damage = tooltyp.stats.atk + tool.iv.atk;
  target.stats.hp -= damage;
  target.stats.hp = Math.max(target.stats.hp, 0);
  addXpToPlayer(sender, Math.floor(damage / 10));
}