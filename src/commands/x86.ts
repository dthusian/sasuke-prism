import { MessageEmbed } from "discord.js";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext, LoadExecContext } from "../lib/context";

export class x86Cmd extends Command {
  linksJSON: { [x: string]: string };
  async load(ctx: LoadExecContext): Promise<void> {
    const buf = await ctx.hostApp.config.loadFile("x86.links.json");
    if(buf === null) throw new Error("Missing asset: x86.links.json");
    this.linksJSON = JSON.parse(buf.toString());
  }
  getCommandString(): string[] {
    return ["x86"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "<instruction>",
      example: "addps",
      message: "Prints an x86 reference page for the specified instruction. Special thanks to Felix Cloutier for the online x86 reference."
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed | string | null> {
    const config = ctx.hostApp.config;
    if(args.length === 0) return null;
    const instr = args[0].toUpperCase();
    let buf = await config.loadFile(`x86/${instr}.json`);
    if(buf === null) {
      buf = await config.loadFile(`x86/${this.linksJSON[instr]}.json`);
    }
    if(buf === null) {
      return `Instruction \`${instr}\` not found.`;
    }
    return new MessageEmbed(JSON.parse(buf.toString()) as MessageEmbed);
  }
}