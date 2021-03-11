import { promises } from "fs";

export class ConfigManager {
  configCache: { [name: string]: unknown };
  constructor() {
    this.configCache = {};
  }
  async load<T>(name: string): Promise<T> {
    if(this.configCache[name]) return this.configCache[name] as T;
    const json = JSON.parse((await promises.readFile("./static/config/" + name + ".json")).toString()) as unknown;
    this.configCache[name] = json;
    return json as T;
  }
  async loadToken(name: string): Promise<string> {
    if(!this.configCache["_tokens"]) {
      this.configCache["_tokens"] = JSON.parse((await promises.readFile("./static/config/_tokens.json")).toString());
    }
    const tokens = this.configCache["_tokens"] as { [x: string]: string };
    return tokens[name];
  }
  async loadColor(name: string): Promise<[number, number, number]> {
    const colorconf = await this.load<{ [x: string]: [number, number, number]}>("colors");
    const embedcolorconf = await this.load<{ [x: string]: string | [number, number, number] }>("embedColors");
    const embedcolorthis = embedcolorconf[name];
    if(typeof embedcolorthis === "object") {
      return embedcolorthis;
    } else {
      return colorconf[embedcolorthis];
    }
  }
  async loadFile(path: string): Promise<Buffer | null> {
    let buf;
    try {
      buf = await promises.readFile("./static/assets/" + path);
    } catch(e) {
      return null;
    }
    return buf;
  }
}