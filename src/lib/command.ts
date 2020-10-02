import { MessageEmbed } from "discord.js";

export abstract class Command {
  abstract getCommandString(): string;
  abstract onCommand(args: string[]): MessageEmbed;
}