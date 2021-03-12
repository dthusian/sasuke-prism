import { Command, CommandReturnType, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";
import { parseSwitches } from "../lib/switches";

export class SimdCmd extends Command {
  getCommandString(): string[] {
    return ["simd"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: [
        "help",
        "op <operation> [--techs=<techs>] [--techs-under=<tech>] [--datatypes=<datatypes>] [--vector-length=<bits>] [--assembly]",
        "list [--techs=<techs>] [--techs-under=<tech>] [--type=<optype>]"
      ],
      message: "Gives information on x86 SIMD intrinsics. " + 
      "--techs is a comma-seperated list of what technologies to filter for. E.g. sse2,avx,avx512vl. " + 
      "--techs-under allows you to specify all technologies that a given technology relies on. " + 
      "--datatypes filters functions by the datatype they are acting on. E.g. f32,i16. " + 
      "--vector-length specifies the length of vectors that should be included. " +
      "--assembly replaces intrinsic functions with assembly mnemonics.",
      example: [
        "help",
        "op hadd --techs-under=avx2 --datatypes=f32 --vector-length=128",
        "list --techs-under=avx2 --type=add"
      ]
    };
  }
  onCommand(args: string[], ctx: CommandExecContext): CommandReturnType {
    const sw = parseSwitches(args);
    return null;
  }
}