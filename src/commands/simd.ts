import { MessageEmbed } from "discord.js";
import { Command, CommandReturnType, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";
import { parseSwitches } from "../lib/switches";
import { makeHelpEmbed } from "./help";

type TechsConfig = {
  [tech: string]: {
    name: string,
    requires: string[]
  }
};

type UArchConfig = {
  [uarch: string]: {
    name: string,
    techs: string[]
  }
};

type OpConfig = {
  title: string,
  description: string[],
  intrinsics: ({
    signature: string,
    vectorLength: number,
    datatype: string,
    tech: string
  })[]
};

function resolveTechDependancies(conf: TechsConfig, tech: string): string[] {
  let unresolved = [tech];
  const resolved: string[] = [];
  while(unresolved.length) {
    const t = unresolved.pop();
    if(t) {
      unresolved = unresolved.concat(conf[t].requires.filter(v => resolved.indexOf(v) === -1));
      resolved.push(t);
    }
  }
  return resolved;
}

function resolveTechFilter(techsConf: TechsConfig, uarchConfig: UArchConfig, techs: string[], techsUnder: string, uarch: string) {
  let union = new Set(techs || []);
  if(uarch) {
    if(!uarchConfig[uarch]) throw new Error("Unknown microarchitecture, run `simd list-uarchs` to get a list of uarchs.");
    uarchConfig[uarch].techs.forEach(v => union.add(v));
  }
  if(techsUnder) {
    resolveTechDependancies(techsConf, techsUnder).forEach(v => union.add(v));
  }
  return Array.from(union.values());
}

const simdOpCmdHelp: HelpMessage = {
  syntax: "<operation> [--techs=<techs>] [--techs-under=<tech>] [--uarch=<uarch>] [--datatypes=<datatypes>] [--vector-length=<bits>]",
  message: "Gives information on a particular type of x86 SIMD instructions. " + 
  "--techs is a comma-seperated list of what technologies to filter for. E.g. sse2,avx,avx512vl. " + 
  "--techs-under allows you to specify all technologies that a given technology relies on. " + 
  "--uarch allows you to specify a platform instead of a list of techs. " +
  "--datatypes filters functions by the datatype they are acting on. E.g. f32,i16. " + 
  "--vector-length specifies the length of vectors that should be included. ",
  example: "hadd --techs-under=avx2 --datatypes=f32 --vector-length=128"
};

const simdListCmdHelp: HelpMessage = {
  syntax: "[--techs=<techs>] [--techs-under=<tech>] [--uarch=<uarch>]",
  message: "Lists operations that can be performed on SIMD vectors. --techs, --techs-under, and --uarch act similarly to the corresponding functions in `simd op`",
  example: "--techs-under=avx2 --type=add"
};

async function subCommandHelp(sw: ReturnType<typeof parseSwitches>, ctx: CommandExecContext): Promise<MessageEmbed | string> {
  const base = `${(await ctx.getGuildData()).prefix}simd ${sw.args[0]}`;
  switch(sw.args[0]) {
    case "op": return makeHelpEmbed(simdOpCmdHelp, base, await ctx.getConfigColor("embedTypeInfo"));
    case "list": return makeHelpEmbed(simdListCmdHelp, base, await ctx.getConfigColor("embedTypeInfo"));
    case "list-uarchs": return "WIP - ping dev to make this exist";
    default: return "Unknown Command"
  }
}

function subCommandOp(sw: ReturnType<typeof parseSwitches>, cmd: SimdCmd, opConf: OpConfig): MessageEmbed | string {
  const embed = new MessageEmbed();
  let techs;
  try {
    techs = resolveTechFilter(cmd.techConfig, cmd.uarchConfig,
      sw.switches["techs"] ? sw.switches["techs"].split(",") : [],
      sw.switches["techs-under"],
      sw.switches["uarch"]);
  } catch(e) {
    return e.message;
  }
  embed.setTitle(opConf.title);
  embed.addField("Description", opConf.description.join(" "));
  for(let i = 0; i < opConf.intrinsics.length; i++) {
    const intrin = opConf.intrinsics[i];
    if(sw.switches["vector-length"] !== undefined) {
      if(parseInt(sw.switches["vector-length"]) !== intrin.vectorLength) continue;
    }
    if(sw.switches["datatype"] !== undefined) {
      if(sw.switches["datatype"].split(",").indexOf(intrin.datatype) === -1) continue;
    }
    if(techs.length) {
      if(techs.indexOf(intrin.tech) === -1) continue;
    }
    // Add intrinsic
    const elementLength = parseInt(intrin.datatype.slice(1));
    embed.addField(intrin.signature.replace(/_/g, "\\_"),
      `${cmd.techConfig[intrin.tech].name} | ${intrin.datatype} x ${intrin.vectorLength / elementLength} = ${intrin.vectorLength} bits`);
  }
  return embed;
}

export class SimdCmd extends Command {
  opsConfig: { [x: string]: OpConfig };
  techConfig: TechsConfig;
  uarchConfig: UArchConfig;

  constructor() {
    super();
    this.opsConfig = {};
  }

  getCommandString(): string[] {
    return ["simd"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: [
        "help <command>",
        "op <operation> [--techs=<techs>] [--techs-under=<tech>] [--uarch=<uarch>] [--datatypes=<datatypes>] [--vector-length=<bits>]",
        "list [--techs=<techs>] [--techs-under=<tech>] [--uarch=<uarch>]",
        "list-uarchs [--before=<year>] [--after=<year>] [--intel] [--amd] [--64]"
      ],
      message: "Gives information on x86 SIMD instructions. Run `simd help <op|list|list-uarchs>` for more info. ",
      example: [
        "help",
        "op hadd --techs-under=avx2 --datatypes=f32 --vector-length=128",
        "list --techs-under=avx2 --type=add"
      ]
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed | string> {
    const subCommand = args[0];
    const sw = parseSwitches(args.slice(1));
    switch(subCommand) {
      case "help": return await subCommandHelp(sw, ctx);
      case "op": {
        if(!this.uarchConfig) {
          const buf = await ctx.getAsset("simd/conf/uarch.json");
          if(buf !== null)
            this.uarchConfig = JSON.parse(buf.toString());
        }
        if(!this.techConfig) {
          const buf = await ctx.getAsset("simd/conf/techs.json");
          if(buf !== null)
            this.techConfig = JSON.parse(buf.toString());
        }
        let opConf = this.opsConfig[sw.args[0]];
        if(!opConf) {
          const buf = await ctx.getAsset("simd/ops/" + sw.args[0] + ".json");
          if(buf === null) return "Unknown Operation";
          opConf = JSON.parse(buf.toString());
          this.opsConfig[sw.args[0]] = opConf;
        }
        return subCommandOp(sw, this, opConf);
      }
      case "list": return "WIP";
      case "list-uarchs": return "WIP";
    }
    return "Unknown Command";
  }
}