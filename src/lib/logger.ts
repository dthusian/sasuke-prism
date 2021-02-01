import { createWriteStream } from "fs";

type WriteFunction = (line: string) => void;

export class Logger {
  outputStream: WriteFunction;
  constructor(stream: WriteFunction) {
    this.outputStream = stream;
  }
  static toFile(path: string): Logger {
    const stream = createWriteStream(path);
    return new Logger(v => { stream.write(v + "\n"); });
  }
  static toStdout(): Logger {
    return new Logger(console.log);
  }
  static toNull(): Logger {
    return new Logger(() => 0);
  }
  private _rawLog(line: string, logtype: string): void {
    this.outputStream(`[${(new Date()).toISOString()} ${logtype}]: ${line}`);
  }
  private _rawLogMulti(message: string, logtype: string): void {
    message.split("\n").forEach(v => this._rawLog(v, logtype));
  }
  logDebug(message: string): void {
    this._rawLogMulti(message, "DEBUG");
  }
  logInfo(message: string): void {
    this._rawLogMulti(message, "INFO");
  }
  logWarning(message: string): void {
    this._rawLogMulti(message, "INFO");
  }
  logError(message: string): void {
    this._rawLogMulti(message, "ERROR");
  }
  logFatal(message: string, exitcode = 1): void {
    this._rawLogMulti(message, "ERROR");
    process.nextTick(() => process.exit(exitcode));
  }
}