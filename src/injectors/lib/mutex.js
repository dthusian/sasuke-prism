function Mutex(){
  this.acquired = false;
  this.resolverQueue = [];
  this.acquire = function(){
    return new Promise(resolve => {
      if(this.acquired){
        this.resolverQueue.push(resolve);
      }else{
        this.acquired = true;
        resolve();
      }
    });
  }.bind(this);
  this.release = function(){
    if(resolverQueue.length){
      var resolve = resolverQueue.shift();
      resolve();
    }else{
      this.acquired = false;
    }
  }.bind(this);
}

module.exports = function injectorMain(gs) {
  gs.Mutex = Mutex;
};

module.exports.Mutex = Mutex;