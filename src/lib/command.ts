import { Application } from "./app";

export abstract class Command {
  abstract getCommandString(): string;
  abstract register(parentApp: Application): Promise<void>;
}