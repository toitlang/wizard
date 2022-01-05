// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import { ChipFamily, EspLoader, ESP_ROM_BAUD, Logger } from "@toit/esptool.js";
import { Completer } from "@toit/esptool.js/build/reader";
import { isTransientError } from "@toit/esptool.js/build/util";
import { isPortAlreadyOpenError, sleep } from "./util";

export function isSupported(): boolean {
  return typeof navigator !== undefined && "serial" in navigator && getChromeVersion() > 86;
}

export async function restart(port: SerialPort): Promise<void> {
  await port.setSignals({ dataTerminalReady: false });
  await port.setSignals({ requestToSend: true });
  await new Promise((resolve) => setTimeout(resolve, 100));
  await port.setSignals({ requestToSend: false });
}

class onCancelReader<T> implements ReadableStreamDefaultReader<T> {
  private reader: ReadableStreamDefaultReader<T>;
  private onCancel: (reason?: unknown) => Promise<void>;

  constructor(reader: ReadableStreamDefaultReader<T>, onCancel: (reason?: unknown) => Promise<void>) {
    this.reader = reader;
    this.onCancel = onCancel;
  }

  read(): Promise<ReadableStreamReadResult<T>> {
    return this.reader.read();
  }

  releaseLock(): void {
    return this.reader.releaseLock();
  }

  get closed(): Promise<void> {
    return this.reader.closed;
  }

  async cancel(reason?: unknown): Promise<void> {
    const res = await this.reader.cancel(reason);
    await this.onCancel(reason);
    return res;
  }
}

function createReadableLineStream(port: SerialPort): ReadableStreamDefaultReader<string> {
  const textDecoder = new TextDecoderStream();
  const lineDecoder = new TransformStream(new LineBreakTransformer());
  if (port.readable === null) {
    throw "readable was null on serial port";
  }
  const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  const readableLineClosed = textDecoder.readable.pipeTo(lineDecoder.writable);
  const reader = lineDecoder.readable.getReader();

  return new onCancelReader<string>(reader, async (reason?: unknown): Promise<void> => {
    await readableLineClosed.catch(() => {});
    await readableStreamClosed.catch(() => {});
  });
}

export interface ReadResult {
  readonly value?: string;
  readonly closed: boolean;
}

export class LineReader {
  private port: SerialPort;
  private closing: boolean;
  private reader: ReadableStreamDefaultReader<string> | undefined;
  private readCompleter: Completer<void> | undefined;
  private timeout: NodeJS.Timeout | undefined;

  constructor(port: SerialPort) {
    this.port = port;
    this.closing = false;
    this.reader = createReadableLineStream(port);
  }

  async read(): Promise<ReadResult> {
    this.readCompleter = new Completer<void>(undefined);
    try {
      return await this._read();
    } finally {
      this.readCompleter.complete();
      this.readCompleter = undefined;
    }
  }

  setTimeout(timeoutMs: number): void {
    this.timeout = setTimeout(() => void this.stop(), timeoutMs);
  }

  private async _read(): Promise<ReadResult> {
    while (!this.closing) {
      if (this.reader === undefined) {
        this.reader = createReadableLineStream(this.port);
      }
      const reader = this.reader;

      try {
        const { value, done } = await this.reader.read();
        if (done) {
          reader.releaseLock();
          this.reader = undefined;
          await sleep(1);
        } else if (value) {
          return { value: value, closed: false };
        }
      } catch (e) {
        await this.closeReader();
        if (!isTransientError(e)) {
          throw e;
        }
        await sleep(1);
      }
    }

    return { closed: true };
  }

  private async closeReader(): Promise<void> {
    const reader = this.reader;
    if (reader === undefined) {
      return;
    }

    try {
      await reader.cancel();
    } catch (e) {}
    reader.releaseLock();
    this.reader = undefined;
  }

  public async stop(): Promise<void> {
    if (this.timeout !== undefined) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }

    this.closing = true;
    await this.closeReader();
    if (this.readCompleter) {
      try {
        await this.readCompleter.promise;
      } catch (e) {}
    }
  }
}

export type Partition = {
  name: string;
  data: Uint8Array;
  offset: number;
};

export type FlashInput = {
  state: FlashState;
  details?: FlashDetails;
};

export type FlashOptions = {
  progressCallback?: (input: FlashInput) => void;
  //progressSerialCallback will have to be removed when serial wizard has been deployed
  progressSerialCallback?: (name: string, i: number, total: number) => void;
  baudRate: number;
  debug: boolean;
  logger: Logger;
  erase: boolean;
};

export enum FlashState {
  STARTED = 0,
  CONNECTING = 1,
  CONNECTED = 2,
  ERASING = 3,
  ERASED = 4,
  WRITING = 5,
  FAILED = 6,
  SUCCESS = 7,
}

export interface FlashDetails {
  partition: string;
  idx: number;
  total: number;
}

export async function checkHardware(port: SerialPort): Promise<boolean> {
  const loader = new EspLoader(port, { debug: false, logger: console });

  try {
    await loader.connect();
    const chipName = await loader.chipName();
    const family = await loader.chipFamily();
    const macAddr = await loader.macAddr();
    console.debug("chipName", chipName, "family", family, "mac addr", macAddr);
    return family == ChipFamily.ESP32;
  } catch (e) {
    console.debug("failed to connect", e);
    return false;
  } finally {
    try {
      await loader.disconnect();
    } catch (error) {
      console.log("Disconnect error", error);
    }
  }
}

export async function flash(
  port: SerialPort,
  partitions: Partition[],
  flashOptions?: Partial<FlashOptions>
): Promise<void> {
  const options: FlashOptions = Object.assign(
    {
      baudRate: ESP_ROM_BAUD,
      debug: false,
      logger: console,
      erase: false,
      progressCallBack: (flashInput: FlashInput) => {},
    },
    flashOptions || {}
  );

  try {
    await port.open({ baudRate: options.baudRate });
  } catch (e) {
    if (!isPortAlreadyOpenError(e)) {
      throw e;
    }
  }
  try {
    const loader = new EspLoader(port, { debug: options.debug, logger: options.logger });
    if (options.progressCallback) options.progressCallback({ state: FlashState.CONNECTING });
    try {
      await loader.connect();
      if (options.progressCallback) options.progressCallback({ state: FlashState.CONNECTED });
      options.logger.log("writing device partitions");
      await loader.loadStub();
      await loader.setBaudRate(options.baudRate, 921600);

      if (options.erase) {
        if (options.progressCallback) options.progressCallback({ state: FlashState.ERASING });
        await loader.eraseFlash();
        if (options.progressCallback) options.progressCallback({ state: FlashState.ERASED });
      }

      for (let i = 0; i < partitions.length; i++) {
        options.logger.log("\nWriting partition: " + partitions[i].name);
        await loader.flashData(partitions[i].data, partitions[i].offset, function (idx, cnt) {
          if (options.progressCallback)
            options.progressCallback({
              state: FlashState.WRITING,
              details: {
                partition: partitions[i].name,
                total: cnt,
                idx: idx,
              },
            });
          if (options.progressSerialCallback) {
            options.progressSerialCallback(partitions[i].name, idx, cnt);
          }
        });
        await sleep(100);
      }
      if (options.progressCallback) options.progressCallback({ state: FlashState.SUCCESS });
    } finally {
      try {
        await loader.disconnect();
      } catch (error) {
        console.log("Disconnect error", error);
      }
    }
  } catch (e) {
    if (options.progressCallback) options.progressCallback({ state: FlashState.FAILED });
    throw e;
  } finally {
    await port.close();
  }
}

export class LineBreakTransformer {
  private chunks = "";

  constructor() {
    // A container for holding stream data until a new line.
    this.chunks = "";
  }

  transform(chunk: string, controller: TransformStreamDefaultController<string>): void {
    // Append new chunks to existing chunks.
    this.chunks += chunk;
    // For each line breaks in chunks, send the parsed lines out.
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop() || "";
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller: TransformStreamDefaultController<string>): void {
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  }
}

function getChromeVersion(): number {
  const re = new RegExp(/Chrom(e|ium)\/([0-9]+)\./);
  const raw = re.exec(navigator.userAgent);
  return raw ? parseInt(raw[2], 10) : -1;
}
