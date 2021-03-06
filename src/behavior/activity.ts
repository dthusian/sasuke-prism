import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";

const games: [
  "PLAYING" | "WATCHING" | "LISTENING", string
][] = [
  ["PLAYING", "Thaumcraft 4"],
  ["PLAYING", "Visual Studio Code"],
  ["PLAYING", "Cytus 2"],
  ["PLAYING", "the bongcloud gambit"],
  ["WATCHING", "Earrape Microphone Tutorial"],
  ["LISTENING", "Datacenter ASMR"]
];

export class ActivityBehavior extends Behavior {
  load(ctx: LoadExecContext): void {
    setInterval(() => {
      const game = games[Math.floor(Math.random() * games.length)];
      const user = ctx.hostApp.bot.user;
      if(user)
        user.setActivity(game[1], { type: game[0] });
    }, 1000 * 60 * 15);
  }
}