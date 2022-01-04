import "../../service/proto/uuid";

import { LineReader, restart } from ".";

type detectHardwareIndeitityOptions = {
  timeoutMs: number;
  restart: boolean;
};

export const errHardwareIdentityNotFound = "hardware identity not found";

export async function detectHardwareIdentity(
  port: SerialPort,
  o?: Partial<detectHardwareIndeitityOptions>
): Promise<HardwareIdentity> {
  const options = Object.assign({ timeoutMs: 5000, restart: true }, o);

  const reader = new LineReader(port);

  if (options.restart) {
    await restart(port);
  }

  reader.setTimeout(options.timeoutMs);

  let identityLine = "";
  try {
    while (true) {
      const { value, closed } = await reader.read();
      if (closed) {
        break;
      }
      if (!value) {
        continue;
      }

      if (value.startsWith("[IDENTITY]")) {
        identityLine = value.substr("[IDENTITY]".length).trim();
        break;
      }
    }
  } finally {
    await reader.stop();
  }

  if (!identityLine) {
    throw errHardwareIdentityNotFound;
  }

  let name = "",
    model = "";
  identityLine.split(",").forEach((value) => {
    const pair = value.split("=");
    if (pair.length === 2) {
      switch (pair[0]) {
        case "model":
          model = pair[1];
          break;
        case "name":
          name = pair[1];
          break;
      }
    }
  });

  if (name.length > 36 && model.length > 0) {
    return {
      model: model,
      name: name,
      hardwareID: name.substr(0, 36),
    };
  }
  throw errHardwareIdentityNotFound;
}

export enum WifiStatus {
  Unknown = "unknown",
  Connected = "connected",
  AccessPointNotFound = "access point not found",
  BadAuthentication = "bad authentication",
  Timeout = "timeout",
}

export enum ConsoleStatus {
  Unknown = "unknown",
  Connected = "connected",
  NotConnected = "not_connected",
}

export class ConnectivityDetector {
  private static ipRegex = /\{ip: (\d{1,3}\.\d{1,3}\.\d{1,3}.\d{1,3})\}/i;
  private static reasonRegex = /\{reason: ([^\}]+)\}/i;

  private running: boolean;
  private runPromise: Promise<void> | undefined;
  private lineReader: LineReader | undefined;

  private _wifiStatus: WifiStatus = WifiStatus.Unknown;
  private _consoleStatus: ConsoleStatus = ConsoleStatus.Unknown;
  public _deviceIP?: string;

  get wifiStatus(): WifiStatus {
    return this._wifiStatus;
  }

  get consoleStatus(): ConsoleStatus {
    return this._consoleStatus;
  }

  get deviceIP(): string | undefined {
    return this._deviceIP;
  }

  constructor() {
    this.running = false;
  }

  public isRunning(): boolean {
    return this.running;
  }

  public async start(port: SerialPort): Promise<void> {
    if (this.lineReader !== undefined) {
      throw "already running";
    }

    await restart(port);
    const lineReader = (this.lineReader = new LineReader(port));
    void this.run(lineReader);
  }

  public async stop(): Promise<void> {
    if (this.lineReader !== undefined) {
      await this.lineReader.stop();
    }
    this.lineReader = undefined;
  }

  public parse(value: string): boolean {
    if (value.indexOf("[toit.wifi] WARN: connect failed") > -1) {
      const result = ConnectivityDetector.reasonRegex.exec(value);
      if (result && result.length === 2) {
        switch (result[1]) {
          case "bad authentication":
            this._wifiStatus = WifiStatus.BadAuthentication;
            return true;
          case "access point not found":
            this._wifiStatus = WifiStatus.AccessPointNotFound;
            return true;
          case "timeout":
            this._wifiStatus = WifiStatus.Timeout;
            return true;
          default:
            console.debug("unhandled wifi status:", result[1]);
        }
      }
    } else if (value.indexOf("[toit.wifi] INFO: got ip") > -1) {
      this._wifiStatus = WifiStatus.Connected;
      const result = ConnectivityDetector.ipRegex.exec(value);
      if (result && result.length === 2) {
        this._deviceIP = result[1];
        return true;
      }
    } else if (value.indexOf("[toit.network]") > -1) {
      if (value.indexOf("failed to connect to any network") > -1) {
        this._consoleStatus = ConsoleStatus.NotConnected;
        return true;
      }
    } else if (value.indexOf("[toit.console_conn] INFO: established") > -1) {
      this._consoleStatus = ConsoleStatus.Connected;
      return true;
    }

    return false;
  }

  private async run(lineReader: LineReader): Promise<void> {
    this.running = true;
    try {
      while (true) {
        const { value, closed } = await lineReader.read();
        if (closed) {
          break;
        }

        if (!value) {
          continue;
        }

        this.parse(value);
      }
    } finally {
      this.running = false;
    }
  }
}

export interface HardwareIdentity {
  model: string;
  name: string;
  hardwareID: string;
}
