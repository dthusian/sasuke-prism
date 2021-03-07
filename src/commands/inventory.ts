import { Command, CommandReturnType, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

class InventoryCmd extends Command {
  getCommandString(): string[] {
    return ["inventory", "inv"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "",
      message: "Lists the items in your possession.",
      example: ""
    }
  }
  onCommand(args: string[], ctx: CommandExecContext): CommandReturnType {
    throw new Error("Method not implemented.");
  }
}