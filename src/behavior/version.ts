import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";

export class VersionBehavior extends Behavior {
  load(ctx: LoadExecContext): void {
    ctx.hostApp.bot.on("message", msg => {
      //TODO
    });
  }
}