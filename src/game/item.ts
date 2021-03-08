import { ConfigManager } from "../lib/config";

// *JSON = Configuration json
// *Data = Database data

export type MaterialJSON = {
  name: string,
  description: string,
  flags: string[]
}

export type ToolClass = "null" | "gun" | "melee" | "armor";

export type ToolJSON = {
  name: string,
  description: string,
  class: ToolClass,
  allowedRarity: number[],
  recipe: { [x: string]: number },
  stats: {
    atk: number,
    spd: number,
    cost: number
  }
}

export type MaterialData = {
  id: string,
  amount: number
}

export type ToolData = {
  id: string,
  rarity: number,
  merge: number,
  iv: {
    atk: number,
    spd: number,
    cost: number
  }
}

export class ItemRegistry {
  config: ConfigManager;
  materials: { [x: string]: MaterialJSON };
  tools: { [x: string]: ToolJSON };
  constructor(config: ConfigManager) {
    this.materials = {};
    this.tools = {};
    this.config = config;
  }
  async loadMaterial(id: string): Promise<void> {
    const buf = await this.config.loadFile("items/material/" + id + ".json");
    if(!buf) {
      throw new Error("Item JSON not found");
    }
    const json = JSON.parse(buf.toString()) as MaterialJSON;
    this.materials[id] = json;
  }
  async loadTool(id: string): Promise<void> {
    const buf = await this.config.loadFile("items/tool/" + id + ".json");
    if(!buf) {
      throw new Error("Item JSON not found");
    }
    const json = JSON.parse(buf.toString()) as ToolJSON;
    this.tools[id] = json;
  }
}