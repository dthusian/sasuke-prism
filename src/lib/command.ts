import { MessageEmbed } from "discord.js";
import { CommandExecContext } from "./context";

type PossiblyAsync<T> = Promise<T> | T;
type PossiblyArrayOrNull<T> = (T | null)[] | (T | null);
export type CommandReturnType = PossiblyAsync<PossiblyArrayOrNull<MessageEmbed> >;

export abstract class Command {
  abstract getCommandString(): string[];
  abstract onCommand(args: string[], ctx: CommandExecContext): CommandReturnType;
}