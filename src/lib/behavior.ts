import { LoadExecContext } from "./context";

export class Behavior {
  load(ctx: LoadExecContext): void | Promise<void> {
    return void ctx;
  }
}