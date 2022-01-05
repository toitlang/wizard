// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.
import {
  DetectState,
  SerialAction,
  UPDATE_CURRENT_PORT,
  UPDATE_CURRENT_PORT_OPEN,
  UPDATE_DETECT_STATE,
} from "../actions/serial";

export type SerialState = {
  readonly currentPort?: SerialPort;
  readonly detectState?: DetectState;
  readonly currentPortOpen?: boolean;
};

export const initialSerialState: SerialState = {};

export default function (state: SerialState = initialSerialState, action: SerialAction): SerialState {
  switch (action.type) {
    case UPDATE_CURRENT_PORT:
      if (action.payload.currentPort === undefined) {
        return {
          ...state,
          currentPort: action.payload.currentPort,
          detectState: undefined,
          currentPortOpen: undefined,
        };
      }
      return {
        ...state,
        currentPort: action.payload.currentPort,
      };
    case UPDATE_DETECT_STATE:
      if (state.currentPort === undefined) {
        console.log("SHOULD NEVER HAPPEN");
        //TODO: Throw error
        return state;
      }

      return {
        ...state,
        detectState: action.payload.detectState,
      };

    case UPDATE_CURRENT_PORT_OPEN:
      if (state.currentPort === undefined) {
        console.log("SHOULD NEVER HAPPEN");
        //TODO: Throw error
        return state;
      }
      return {
        ...state,
        currentPortOpen: action.payload.currentPortOpen,
      };
    default:
      return state;
  }
}
