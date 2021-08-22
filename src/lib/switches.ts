export function parseSwitches(args: string[]): { switches: { [x: string]: string }, args: string[] } {
  const ret: ReturnType<typeof parseSwitches> = {
    switches: {},
    args: []
  };
  for(let i = 0; i < args.length; i++) {
    const el = args[i];
    if(el.startsWith("--")) {
      const spl = el.slice(2).split("=");
      const val = spl[1];
      if(val === undefined) {
        ret.switches[spl[0]] = "true";
      } else {
        ret.switches[spl[0]] = val;
      }
    } else {
      ret.args.push(el);
    }
  }
  return ret;
}