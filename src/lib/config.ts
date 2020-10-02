import { promises } from "fs";

export class ConfigManager {
  configCache: { [name: string]: unknown };
  async load(name: string): Promise<unknown> {
    if(this.configCache[name]) return this.configCache[name];
    const json = JSON.parse((await promises.readFile("./config/" + name + ".json")).toString()) as unknown;
    this.configCache[name] = json;
    return json;
  }
  async token(name: string): Promise<string> {
    if(!this.configCache["_tokens"]) {
      this.configCache["_tokens"] = await promises.readFile("./config/_tokens.json");
    }
    return (this.configCache["_tokens"] as { [x: string]: string })[name];
  }
}