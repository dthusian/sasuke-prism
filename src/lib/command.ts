import { MessageEmbed } from "discord.js";
import { ExecContext } from "./context";

export abstract class Command {
  abstract getCommandString(): string[];
  abstract onCommand(args: string[], ctx: ExecContext): Promise<MessageEmbed> | MessageEmbed;
}