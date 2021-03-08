import { Guild, MessageEmbed, TextChannel, Webhook } from "discord.js";
import { PassThrough } from "form-data";
import { Application } from "../lib/app";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

const DISCORD_MAX_WEBHOOKS = 10;
let globalDroneFactory = 10;

const ongoingDronestrikes: { [gid: string]: Dronestrike | null } = {};

export class Dronestrike {
  // Configable stuff
  contentFactory: () => (string | MessageEmbed);
  maxDrones: number;
  avatar: string;
  targetGuild: Guild;
  ignoreChannels: string[];

  // Constructor
  app: Application;
  constructor(app: Application) {
    this.maxDrones = Infinity;
    this.app = app;
    this.fired = 0;
    this.ignoreChannels = [];
    this.drones = 0;
  }

  // Stats
  fired: number;
  drones: number;
  promise: Promise<void>;

  private async singleHit(whList: Webhook[], content: () => string | MessageEmbed): Promise<number> {
    const proms = [];
    let fired = 0;
    const increFired = () => { fired++; };
    for(let i = 0; i < whList.length; i++) {
      if(whList[i]){
        try {
          proms.push(whList[i].send(content())
          .then(increFired)
          .catch(() => {
            delete whList[i];
          }));
        } catch(e) { e; } // Swallow errors
      }
    }
    await Promise.all(proms);
    return fired;
  }

  async run(): Promise<string | void> {
    if(!this.targetGuild) return;
    if(this.app.bot.user === null) return;
    const gmember = this.targetGuild.member(this.app.bot.user);
    if(gmember === null) return;
    const hasPerm = gmember.permissions.has("MANAGE_WEBHOOKS");
    if(!hasPerm) return "Not enough permissions.";
    ongoingDronestrikes[this.targetGuild.id] = this;
    const prom = new Promise<void>(resolve => {
      const guild = this.targetGuild;
      Promise.all(guild.channels.cache.array().map(async v => {
        if(v instanceof TextChannel && !this.ignoreChannels.includes(v.id)) {
          const hooks = (await v.fetchWebhooks()).array();
          for(let i = hooks.length; i < DISCORD_MAX_WEBHOOKS; i++) {
            try {
              hooks.push(await v.createWebhook("Attack Helicopter " + (globalDroneFactory++), {
                avatar: this.avatar
              }));
            } catch(e) { e; } // Swallow errors
          }
          return hooks;
        }
        return [];
      })).then(hooks => {
        const fullhooklist = hooks.flat();
        this.drones = fullhooklist.length;
        const interval = setInterval(async () => {
          const fired = await this.singleHit(fullhooklist, this.contentFactory);
          this.fired += fired;
          if(fullhooklist.filter(v => v).length === 0) {
            endStrike();
          }
        }, 7000);
        const endStrike = () => {
          clearInterval(interval);
          resolve();
          ongoingDronestrikes[this.targetGuild.id] = null;
        }
        setTimeout(endStrike, 1000000);
      });
    });
    this.promise = prom;
    await prom;
  }
}

export class DronestrikeCmd extends Command {
  constructor() {
    super();
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
    if(!ctx.msg.guild) return null;
    const gid = ctx.msg.guild.id;
    if(!message) {
      if(ongoingDronestrikes[gid] && ongoingDronestrikes[gid] !== null) {
        const ongoing = ongoingDronestrikes[gid];
        if(ongoing !== null){
          return `**Ongoing dronestrike** | ${ongoing.drones} bots | ${ongoing.fired} fired`;
        } else {
          return null;
        }
      } else {
        return "Drones ready.";
      }
    } else {
      if(ongoingDronestrikes[gid] && ongoingDronestrikes[gid] !== null) {
        return "There is already a dronestrike ongoing!";
      } else {
        const dronestrike = new Dronestrike(ctx.app);
        dronestrike.contentFactory = () => message;
        dronestrike.targetGuild = ctx.msg.guild;
        dronestrike.ignoreChannels = [ctx.msg.channel.id];
        dronestrike.run();
        return "Dronestrike authorized.";
      }
    }
  }
}