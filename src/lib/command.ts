import { MessageEmbed } from "discord.js";
import { CommandExecContext } from "./context";

export abstract class Command {
  abstract getCommandString(): string[];
  abstract onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed> | MessageEmbed;
}