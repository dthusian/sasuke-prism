export const levelData: [string | number, string, number][] = [
  [5,    "Point",        100],
  [10,   "Segment",      250],
  [15,   "Ray",          250],
  [20,   "Line",         250],
  [30,   "Triangle",     500],
  [40,   "Square",       500],
  [50,   "Hexagon",      500],
  [65,   "Tetrahedron",  750],
  [80,   "Prism",        750],
  [95,   "Octahedron",   750],
  [110,  "Dodecahedron", 750],
  [125,  "Icosahedron",  750],
  ["+",  "Hyperprism",   1000]
];

function levelSearch(level: number, index: number): string | number {
  for(let i = 0; i < levelData.length; i++) {
    if(level <= levelData[i][0]) return levelData[i][index];
  }
  return levelData[levelData.length - 1][index];
}

export function getTitleFromLevel(level: number): string {
  return levelSearch(level, 1) as string;
}

export function getReqdExp(level: number): number {
  return levelSearch(level, 2) as number;
}