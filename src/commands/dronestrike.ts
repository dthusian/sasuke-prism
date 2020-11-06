import { TextChannel, Webhook } from "discord.js";
import { Application } from "../lib/app";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

const DISCORD_MAX_WEBHOOKS = 10;

class DroneManager {
  droneFactory = 10;
  makeDrone(): number {
    return this.droneFactory++;
  }

  ongoing: {
    [ gid: string ]: { prom: Promise<void>, res: () => void, bots: number, fired: number }
  }

  singleHit(whList: Webhook[], content: string): Promise<void> {
    return Promise.all(whList.map(async v => void await v.send(content))) as unknown as Promise<void>;
  }

  dronestrike(gid: string, app: Application, content: string): void {
    if(!this.hasDronestrike(gid)) {
      this.ongoing[gid] = {
        prom: new Promise(resolve => {
          const stat = this.ongoing[gid];
          stat.res = resolve;
          const guild = app.bot.guilds.resolve(gid);
          if(guild === null) {
            resolve();
            return;
          }
          Promise.all(guild.channels.cache.array().map(async v => {
            if(v instanceof TextChannel) {
              const hooks = (await v.fetchWebhooks()).array();
              for(let i = hooks.length; i < DISCORD_MAX_WEBHOOKS; i++) {
                hooks.push(await v.createWebhook("Attack Helicopter " + this.makeDrone(), {
                  avatar: await app.config.loadFile("attack-heli.txt")
                }));
              }
              return hooks;
            }
            return [];
          })).then(hooks => {
            const fullhooklist = hooks.flat();
            const interval = setInterval(() => {
              this.singleHit(fullhooklist, content);
            }, 2000);
            setTimeout(() => {
              clearInterval(interval);
              resolve();
              delete this.ongoing[gid];
            }, 1000000);
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
    this.manager = new DroneManager();
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
        this.manager.dronestrike(gid, ctx.hostApp, message);
        return "Dronestrike authorized.";
      }
    }
  }
}