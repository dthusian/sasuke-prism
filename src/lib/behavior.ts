import { EventEmitter } from "events";
import { LoadExecContext } from "./context";

export class Behavior extends EventEmitter {
  on(ev: "load", fn: (ctx: LoadExecContext) => void): this;
  on(ev: string, fn: unknown): this {
    super.on(ev, fn as (...args: unknown[]) => unknown);
    return this;
  }
}