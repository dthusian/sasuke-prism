export class Item {

}

export class ItemRegistry {
  reg: { [x: string]: Item }
  constructor() {
    this.reg = {};
  }
}