import { ConfigManager } from "../lib/config";

export type ItemJSON = {
  name: string,
  description: string,
  flags: string[]
}

export class ItemType {
  name: string;
  description: string;
  flags: string[];
  id: string;

  constructor() {
    this.name = "<null>";
    this.description = "No description";
    this.flags = [];
  }

  hasFlag(flag: string): boolean {
    return this.flags.includes(flag);
  }
}

function itemFromJSON(id: string, json: ItemJSON): ItemType {
  const ret = new ItemType();
  ret.id = id;
  ret.name = json.name;
  ret.description = json.description;
  ret.flags = json.flags || [];
  return ret;
}

export class ItemRegistry {
  config: ConfigManager;
  reg: { [x: string]: ItemType }
  constructor(config: ConfigManager) {
    this.reg = {};
    this.config = config;
  }
  async load(id: string): Promise<void> {
    const buf = await this.config.loadFile("items/" + id + ".json");
    if(!buf) {
      throw new Error("Item JSON not found");
    }
    const json = JSON.parse(buf.toString()) as ItemJSON;
    this.reg[id] = itemFromJSON(id, json);
  }
}