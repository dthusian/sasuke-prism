export class ConfigManager {
  configCache: { [name: string]: unknown };
  async load(): Promise<unknown> {
    return 0;
  }
  getInstance(): ConfigManager {
    return this;
  }
}