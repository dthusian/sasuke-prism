import { MessageEmbed, TextChannel, Webhook } from "discord.js";
import { Application } from "../lib/app";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext, LoadExecContext } from "../lib/context";

const DISCORD_MAX_WEBHOOKS = 10;

export class DroneManager {
  droneFactory = 10;
  attackheli: string;
  makeDrone(): number {
    return this.droneFactory++;
  }

  ongoing: {
    [ gid: string ]: { prom: Promise<void>, res: () => void, bots: number, fired: number }
  };

  constructor(attackheli: string) {
    this.ongoing = {};
    this.attackheli = attackheli;
  }

  async singleHit(whList: Webhook[], content: () => string | MessageEmbed): Promise<void> {
    const proms = [];
    for(let i = 0; i < whList.length; i++) {
      if(whList[i]){
        proms.push(whList[i].send(content())
        .catch(() => {
          delete whList[i];
        }));
      }
    }
    await Promise.all(proms);
  }

  dronestrike(gid: string, cid: string, app: Application, content: () => string | MessageEmbed): void {
    if(!this.hasDronestrike(gid)) {
      this.ongoing[gid] = {
        prom: new Promise(resolve => {
          const guild = app.bot.guilds.resolve(gid);
          if(guild === null) {
            resolve();
            return;
          }
          Promise.all(guild.channels.cache.array().map(async v => {
            if(v instanceof TextChannel && v.id !== cid) {
              const hooks = (await v.fetchWebhooks()).array();
              for(let i = hooks.length; i < DISCORD_MAX_WEBHOOKS; i++) {
                hooks.push(await v.createWebhook("Attack Helicopter " + this.makeDrone(), {
                  avatar: this.attackheli
                }));
              }
              return hooks;
            }
            return [];
          })).then(hooks => {
            const fullhooklist = hooks.flat();
            const interval = setInterval(() => {
              this.singleHit(fullhooklist, content);
            }, 7000);
            setTimeout(endStrike, 1000000);
            function endStrike() {
              clearInterval(interval);
              resolve();
              delete this.ongoing[gid];
            }
          });
        }),
        res: () => { return; },
        bots: 0,
        fired: 0
      };
    }
  }
  hasDronestrike(gid: string): boolean {
    return !!this.ongoing[gid];
  }
}

export class DronestrikeCmd extends Command {
  manager: DroneManager;
  constructor() {
    super();
  }
  async load(ctx: LoadExecContext): Promise<void> {
    const helicopter = await ctx.hostApp.config.loadFile("attack-heli.txt");
    if(helicopter === null) throw new Error("Missing asset: attack-heli.txt");
    this.manager = new DroneManager(helicopter.toString());
  }
  getCommandString(): string[] {
    return ["dronestrike", "ds"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "<message>",
      example: "@everyone hey technoblade",
      message: "Go! Launch the attack helicopters!"
    }
  }
  onCommand(args: string[], ctx: CommandExecContext): string | null {
    const message = args.join(" ");
    if(!ctx.message.guild) return null;
    const gid = ctx.message.guild.id;
    if(!message) {
      if(this.manager.hasDronestrike(gid)) {
        const ongoing = this.manager.ongoing[gid];
        return `**Ongoing dronestrike** | ${ongoing.bots} bots | ${ongoing.fired} fired`;
      } else {
        return "Drones ready.";
      }
    } else {
      if(this.manager.hasDronestrike(gid)) {
        return "There is already a dronestrike ongoing!";
      } else {
        this.manager.dronestrike(gid, ctx.message.channel.id, ctx.hostApp, () => message);
        return "Dronestrike authorized.";
      }
    }
  }
}