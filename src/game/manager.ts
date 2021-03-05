import { Application } from "../lib/app";
import { ItemRegistry } from "./item";

export class GameManager {
  items: ItemRegistry;
  constructor(app: Application) {
    this.items = new ItemRegistry(app.config);
  }

  async load(): Promise<void> {
    await this.items.loadMaterial("test");
  }
}