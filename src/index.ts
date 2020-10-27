import { Application } from "./lib/app";

import { DiceCmd } from "./commands/dice";
import { LevelCmd } from "./commands/level";
import { ActivityBehavior } from "./behavior/activity";

async function main() {
  const app = new Application();
  await app.load();
  app.registerCommand(new DiceCmd());
  app.registerCommand(new LevelCmd());
  app.addBehavior(new ActivityBehavior());
  await app.execute();
}

main();