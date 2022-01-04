import { HardwareIdentity } from "../misc/serial/toitserial";

export const UPDATE_CURRENT_PORT = "UPDATE_CURRENT_PORT";
export const UPDATE_DETECT_STATE = "UPDATE_DETECT_STATE";
export const UPDATE_CURRENT_PORT_OPEN = "UPDATE_CURRENT_PORT_OPEN";
export const UPDATE_WIZARD_SETUP_STATE = "UPDATE_WIZARD_SETUP_STATE";

type UpdateCurrentPort = {
  type: typeof UPDATE_CURRENT_PORT;
  payload: { currentPort?: SerialPort };
};
export const updateCurrentPort = (port?: SerialPort): UpdateCurrentPort => ({
  type: UPDATE_CURRENT_PORT,
  payload: { currentPort: port },
});

export interface DetectState {
  hardwareIdentity?: HardwareIdentity | null;
  hardwareValid?: boolean;
  deviceID?: string;
}

export type UpdateDetectState = {
  type: typeof UPDATE_DETECT_STATE;
  payload: { detectState?: DetectState };
};

export const updateDetectState = (state?: DetectState): UpdateDetectState => ({
  type: UPDATE_DETECT_STATE,
  payload: { detectState: state },
});

export type UpdateCurrentPortOpen = {
  type: typeof UPDATE_CURRENT_PORT_OPEN;
  payload: { currentPortOpen: boolean };
};

export const updateCurrentPortOpen = (currentPortOpen: boolean): UpdateCurrentPortOpen => ({
  type: UPDATE_CURRENT_PORT_OPEN,
  payload: { currentPortOpen: currentPortOpen },
});

export type SerialAction = UpdateCurrentPort | UpdateDetectState | UpdateCurrentPortOpen;
