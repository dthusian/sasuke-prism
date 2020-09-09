import { Command } from "../lib/command";
import { Application } from "../lib/app";

export class DiceCmd extends Command {
  register(parentApp: Application): Promise<void> {
    throw new Error("Method not implemented.");
  }
}