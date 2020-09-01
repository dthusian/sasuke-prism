module.exports = function injectorMain(gs){
  gs.bot.on("message", msg => {
    if(!gs.normalMsg(msg)) return;
    
  });
};