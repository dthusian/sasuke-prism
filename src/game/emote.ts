const emotes: { [x: string]: string } = {
  "star1": ":one:",
  "star2": ":two:",
  "star3": ":three:",
  "star4": ":four:",
  "star5": ":five:"
};

export function makeRarity(rarity: number): string {
  return (new Array(rarity) as string[]).fill(emotes["star" + rarity], 0, rarity).join(" ");
}