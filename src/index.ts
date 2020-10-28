import { Application } from "./lib/app";

import { DiceCmd } from "./commands/dice";
import { LevelCmd } from "./commands/level";
import { IPCmd } from "./commands/ip";

import { ActivityBehavior } from "./behavior/activity";
import { UwUBanBehavior } from "./behavior/banuwu";

async function main() {
  const app = new Application();
  await app.load();

  app.registerCommand(new DiceCmd());
  app.registerCommand(new LevelCmd());
  app.registerCommand(new IPCmd());

  app.addBehavior(new ActivityBehavior());
  app.addBehavior(new UwUBanBehavior());

  await app.execute();
}

main();