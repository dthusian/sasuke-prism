import { Application } from "./lib/app";

import { DiceCmd } from "./commands/dice";
import { LevelCmd } from "./commands/level";
import { IPCmd } from "./commands/ip";
import { DronestrikeCmd } from "./commands/dronestrike";
import { PrefixCmd } from "./commands/prefix";
import { SudoCmd } from "./commands/sudo";
import { HelpCmd } from "./commands/help";

import { VersionBehavior } from "./behavior/version";
import { ActivityBehavior } from "./behavior/activity";
import { UwUBanBehavior } from "./behavior/banuwu";
import { PassivesBehavior } from "./behavior/passives";
import { InfoCmd } from "./commands/info";
import { InventoryCmd } from "./commands/inventory";
import { AttackCmd } from "./commands/attack";
import { SimdCmd } from "./commands/simd";

async function main() {
  const app = new Application();
  await app.load();

  app.registerCommand(new DiceCmd());
  app.registerCommand(new LevelCmd());
  app.registerCommand(new IPCmd());
  app.registerCommand(new DronestrikeCmd());
  app.registerCommand(new PrefixCmd());
  app.registerCommand(new SudoCmd());
  app.registerCommand(new HelpCmd());
  app.registerCommand(new InfoCmd());
  app.registerCommand(new InventoryCmd());
  app.registerCommand(new AttackCmd());
  app.registerCommand(new SimdCmd());

  app.addBehavior(new ActivityBehavior());
  app.addBehavior(new UwUBanBehavior());
  app.addBehavior(new PassivesBehavior());
  app.addBehavior(new VersionBehavior());

  await app.execute();
}

main();