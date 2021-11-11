import { CommandExecContext, LoadExecContext } from "./context";

export type HelpMessage = { syntax: string | string[], message: string, example: string | string[] };

export class CommandGroup {
  commandString: string[];
  commands: Command[];
  constructor(cstr: string[], cmds: Command[]) {
    this.commandString = cstr;
    this.commands = cmds;
  }
  getCommandString(): string[] {
    return this.commandString;
  }
}

export type CommandArguments = ({
  name: string,
  type: "string" | "number" | "boolean" | "user",
  required: boolean
})[];

export abstract class Command {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(_ctx: LoadExecContext): Promise<void> { return Promise.resolve(); }
  abstract getCommandString(): string[];
  abstract getArguments(): CommandArguments;
  abstract onCommand(ctx: CommandExecContext): Promise<void>;
}