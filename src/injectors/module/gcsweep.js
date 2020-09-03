"use strict";

const GC_INTERVAL_MS = 60 * 60 * 1000;

module.exports = function injectorMain(gs) {
  setInterval(async () => {
    await gs.clearCache();
  }, GC_INTERVAL_MS);
};