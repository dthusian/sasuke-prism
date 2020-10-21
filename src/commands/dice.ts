import { Command } from "../lib/command";
import { Application } from "../lib/app";
import { MessageEmbed } from "discord.js";

export class DiceCmd extends Command {
  getCommandString(): string[] {
    return ["dice", "d"];
  }
  onCommand(args: string[]): MessageEmbed {
    throw new Error("Method not implemented.");
  }
}