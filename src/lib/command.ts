import { MessageEmbed } from "discord.js";
import { CommandExecContext } from "./context";

type PossiblyAsync<T> = Promise<T> | T;
type PossiblyArrayOrNull<T> = (T | null)[] | (T | null);
export type CommandReturnType = PossiblyAsync<PossiblyArrayOrNull<MessageEmbed> >;
export type HelpMessage = { syntax: string, message: string, example: string };

export abstract class Command {
  abstract getCommandString(): string[];
  abstract getHelpMessage(): HelpMessage;
  abstract onCommand(args: string[], ctx: CommandExecContext): CommandReturnType;
}