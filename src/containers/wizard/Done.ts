// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  updateCurrentPort,
  UpdateCurrentPort,
  UpdateCurrentPortOpen,
  updateCurrentPortOpen,
} from "../../actions/serial";
import { WizardReduxAction } from "../../actions/wizard";
import DoneView from "../../components/wizard/DoneView";
import { RootState } from "../../store";

const mapStateToProps = (state: RootState) => {
  return {
    currentPort: state.serial.currentPort,
    currentPortOpen: state.serial.currentPortOpen,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, void, UpdateCurrentPortOpen | UpdateCurrentPort | WizardReduxAction>
) => {
  return {
    updateCurrentPort: (state: SerialPort | undefined) => {
      dispatch(updateCurrentPort(state));
    },
    updateCurrentPortOpen: (state: boolean) => {
      dispatch(updateCurrentPortOpen(state));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DoneView);
