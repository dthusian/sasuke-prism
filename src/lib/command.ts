import { MessageEmbed } from "discord.js";
import { Application } from "./app";

export abstract class Command {
  abstract getCommandString(): string[];
  abstract onCommand(args: string[], hostApp: Application): Promise<MessageEmbed> | MessageEmbed;
}