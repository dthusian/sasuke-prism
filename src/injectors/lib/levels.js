const titles = [
  [5, "Point"],
  [10, "Segment"],
  [15, "Ray"],
  [20, "Line"],
  [30, "Triangle"],
  [40, "Square"],
  [50, "Hexagon"],
  [65, "Tetrahedron"],
  [80, "Prism"],
  [95, "Octahedron"],
  [110, "Dodecahedron"],
  [125, "Icosahedron"],
  ["And beyond!", "Hyperprism"]
];

module.exports = function injectorMain(gs){
  gs.addXP = function addXP(amount, playerJSON) {
    //TODO
  };

  gs.getXPAmount = function getXPAmount(level) {
    return 500 + 50 * level
  };

  gs.getTitle = function getTitle(level) {
    for(var i = 0; i < titles.length; i++) {
      if(level <= titles[i][0]) return titles[i][1];
    }
    return titles[i][1];
  };
};