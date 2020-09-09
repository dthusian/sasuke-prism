import { Application } from "./lib/app";

import { DiceCmd } from "./commands/dice";

const app = new Application();
app.registerCommand(new DiceCmd());
app.execute();