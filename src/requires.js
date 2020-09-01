function RequireManager(){
  this.promises = {};
  this.require = function (module) {
    return new Promise((resolve, reject) => {
      if (this.promises[module] === true) {
        // The module was already sated
        resolve();
        return;
      }
      if (!this.promises[module]) this.promises[module] = [];
      this.promises[module].push({
        resolve: resolve,
        reject: reject
      });
    });
  }.bind(this);
  this.satisfy = function (module) {
    if (this.promises[module] === true) return;
    if (this.promises[module] instanceof Array) {
      this.promises[module].forEach(v => v.resolve());
    }
    this.promises[module] = true;
  }.bind(this);
  this.drop = function (module) {
    var toDrop;
    if (!module) {
      toDrop = Object.values(this.promises).flat();
    } else {
      toDrop = this.promises[module];
    }
    toDrop.forEach(v =>
      (v instanceof Promise) ?
      v.reject(new Error(`Module ${module} dropped`))
      : undefined);
  }.bind(this);
}

module.exports = RequireManager;