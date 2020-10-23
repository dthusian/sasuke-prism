type ResolveFn<T> = (v: T) => void;

export class Mutex {
  ac: boolean;
  queue: ResolveFn<void>[];
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
  release() {
    if(this.queue.length){
      this.queue.shift()();
    }else{
      this.ac = false;
    }
  }
}