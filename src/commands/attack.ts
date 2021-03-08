import { Command, CommandReturnType, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

export class AttackCmd extends Command {
  getCommandString(): string[] {
    return ["attack"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "<person>",
      message: "Attack someone using your equipped weapon.",
      example: "<@733732240680419479>"
    };
  }
  onCommand(args: string[], ctx: CommandExecContext): CommandReturnType {
    throw new Error("Method not implemented.");
  }
}