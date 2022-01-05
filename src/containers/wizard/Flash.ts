// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { DetectState, SerialAction, updateCurrentPortOpen, updateDetectState } from "../../actions/serial";
import {
  FlashingProperties,
  updateCurrentAction,
  updateFlashingProperties,
  WizardAction,
  WizardError,
  WizardReduxAction,
} from "../../actions/wizard";
import FlashView from "../../components/wizard/FlashView";
import { RootState } from "../../store";

const mapStateToProps = (state: RootState) => {
  return {
    currentPort: state.serial.currentPort,
    detectState: state.serial.detectState,
    currentPortOpen: state.serial.currentPortOpen,
    flashingProperties: state.wizard.flashingProperties,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, SerialAction | WizardReduxAction>) => {
  return {
    updateDetectState: (state?: DetectState) => {
      dispatch(updateDetectState(state));
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

export default connect(mapStateToProps, mapDispatchToProps)(FlashView);
