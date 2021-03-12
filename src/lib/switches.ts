export function parseSwitches(args: string[]): { switches: { [x: string]: string }, args: string[] } {
  const ret: ReturnType<typeof parseSwitches> = {
    switches: {},
    args: []
  };
  for(let i = 0; i < args.length; i++) {
    const el = args[i];
    if(el.startsWith("--")) {
      const val = el.split("=")[1];
      if(val === undefined) {
        ret.switches[el.slice(2)] = "true";
      } else {
        ret.switches[el.slice(2)] = val;
      }
    } else {
      args.push(el);
    }
  }
  return ret;
}