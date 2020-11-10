import { MessageEmbed } from "discord.js";
import { CommandExecContext, LoadExecContext } from "./context";

type PossiblyAsync<T> = Promise<T> | T;
type PossiblyArray<T> = T[] | T;
type MessageContent = MessageEmbed | string | null;
export type CommandReturnType = PossiblyAsync<PossiblyArray<MessageContent> >;
export type HelpMessage = { syntax: string | string[], message: string, example: string | string[] };

export abstract class Command {
  load(ctx: LoadExecContext): Promise<void> { return Promise.resolve(); }
  abstract getCommandString(): string[];
  abstract getHelpMessage(): HelpMessage;
  abstract onCommand(args: string[], ctx: CommandExecContext): CommandReturnType;
}