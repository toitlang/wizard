import { ESP_ROM_BAUD } from "@toit/esptool.js";
import { DetectState } from "../../actions/serial";
import * as Serial from "../../misc/serial";
import { isPortAlreadyClosedError, isPortAlreadyOpenError } from "../../misc/serial/util";

//Serial function for opening port
export async function openPort({ updateCurrentPortOpen, currentPort, currentPortOpen }: PortOptions): Promise<void> {
  if (!currentPort || currentPortOpen) {
    return;
  }

  try {
    await currentPort.open({ baudRate: ESP_ROM_BAUD });
  } catch (e) {
    if (!isPortAlreadyOpenError(e)) {
      throw e;
    }
  }
  updateCurrentPortOpen(true);
}

export interface PortOptions {
  readonly updateCurrentPortOpen: (state: boolean) => void;
  readonly currentPort?: SerialPort;
  readonly currentPortOpen?: boolean;
}

//Serial function for closing port
export async function closePort({ updateCurrentPortOpen, currentPort, currentPortOpen }: PortOptions): Promise<void> {
  if (!currentPort || !currentPortOpen) {
    return;
  }

  let closed = false;
  try {
    await currentPort?.close();
    closed = true;
  } catch (e) {
    if (!isPortAlreadyClosedError(e)) {
      console.error("failed to close port", e);
    } else {
      closed = true;
    }
  }
  if (closed) {
    updateCurrentPortOpen(false);
  }
}

export interface DetectOptions extends PortOptions {
  readonly currentPort?: SerialPort;
  readonly currentPortOpen?: boolean;
  readonly updateDetectState: (state: DetectState) => void;
}

export async function detect({ updateDetectState, currentPort, currentPortOpen }: DetectOptions): Promise<void> {
  if (!currentPort || !currentPortOpen) {
    return;
  }
  let hardwareValid = false;
  try {
    hardwareValid = await Serial.checkHardware(currentPort);
  } catch (e) {
    hardwareValid = false;
    throw e;
  }
  updateDetectState({ hardwareValid: hardwareValid });
  if (!hardwareValid) {
    return;
  }
}
