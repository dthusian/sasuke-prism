import { promises } from "fs";

export class ConfigManager {
  configCache: { [name: string]: unknown };
  constructor() {
    this.configCache = {};
  }
  async load(name: string): Promise<unknown> {
    if(this.configCache[name]) return this.configCache[name];
    const json = JSON.parse((await promises.readFile("./static/config/" + name + ".json")).toString()) as unknown;
    this.configCache[name] = json;
    return json;
  }
  async token(name: string): Promise<string> {
    if(!this.configCache["_tokens"]) {
      this.configCache["_tokens"] = JSON.parse((await promises.readFile("./static/config/_tokens.json")).toString());
    }
    const tokens = this.configCache["_tokens"] as { [x: string]: string };
    return tokens[name];
  }
  async loadColor(name: string): Promise<[number, number, number]> {
    return (await this.load("colors") as { [x: string]: [number, number, number]})[
      (await this.load("embedColors") as { [x: string]: string })[name]
    ];
  }
}