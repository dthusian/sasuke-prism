import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";

const games: [
  "PLAYING" | "WATCHING" | "LISTENING", string
][] = [
  ["PLAYING", "Cytus 2"],
  ["PLAYING", "the bongcloud gambit"],
  ["PLAYING", "Spelunky 2"],
  ["PLAYING", "Team Fortress 2"],
  ["WATCHING", "Earrape Microphone Tutorial"],
  ["WATCHING", "mINCERAGT 69 hUNErt sv SPedrn ER"],
  ["WATCHING", "paint dry"],
  ["WATCHING", "[NFT] free money glitch 2021 working"],
  ["WATCHING", "ur mom"],
  ["LISTENING", "sabi - true DJ MAG top ranker's song Zenpen (katagiri remix)"],
  ["LISTENING", "DJ Army - Play"],
  ["LISTENING", "Frums - Xnor Xnor Xnor"],
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