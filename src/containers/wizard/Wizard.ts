// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  DetectState,
  SerialAction,
  updateCurrentPort,
  updateCurrentPortOpen,
  updateDetectState,
} from "../../actions/serial";
import {
  FlashingProperties,
  updateCurrentAction,
  updateFlashingProperties,
  WizardAction,
  WizardError,
  WizardReduxAction,
} from "../../actions/wizard";
import WizardView from "../../components/wizard/WizardView";
import { RootState } from "../../store";

export interface FirmwareNameModel {
  name: string;
  models: string[];
}

const mapStateToProps = (state: RootState) => {
  const serial = state.serial;
  const wizard = state.wizard;
  return {
    flashingProperties: wizard.flashingProperties,
    currentPort: serial.currentPort,
    detectState: serial.detectState,
    currentPortOpen: serial.currentPortOpen,
    currentAction: wizard.currentAction,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, SerialAction | WizardReduxAction>) => {
  return {
    updateDetectState: (state: DetectState) => {
      dispatch(updateDetectState(state));
    },
    updateCurrentPort: (state: SerialPort | undefined) => {
      dispatch(updateCurrentPort(state));
    },
    updateCurrentPortOpen: (state: boolean) => {
      dispatch(updateCurrentPortOpen(state));
    },
    updateCurrentAction: (state: WizardAction | WizardError) => {
      dispatch(updateCurrentAction(state));
    },
    updateFlashingProperties: (state: FlashingProperties) => {
      dispatch(updateFlashingProperties(state));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardView);
