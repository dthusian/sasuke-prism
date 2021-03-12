type ResolveFn<T> = (v: T) => void;

export class Mutex {
  ac: boolean;
  queue: ResolveFn<void>[];
  constructor() {
    this.ac = false;
    this.queue = [];
  }
  acquire(): Promise<void> {
    return new Promise(resolve => {
      if(this.ac) {
        this.queue.push(resolve);
      } else {
        this.ac = true;
        resolve();
      }
    });
  }
  release(): void {
    if(this.queue.length){
      const shifted = this.queue.shift();
      if(shifted) process.nextTick(shifted);
    }else{
      this.ac = false;
    }
  }
}