import { Application } from "./lib/app";

import { DiceCmd } from "./commands/dice";

async function main() {
  const app = new Application();
  await app.load();
  app.registerCommand(new DiceCmd());
  app.execute();
}

main();