/* eslint-disable @typescript-eslint/no-unsafe-call */
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { SerialAction, updateCurrentPort, updateCurrentPortOpen } from "../../actions/serial";
import {
  FlashingProperties,
  updateCurrentAction,
  updateFlashingProperties,
  WizardAction,
  WizardError,
  WizardReduxAction,
} from "../../actions/wizard";
import SetupView from "../../components/wizard/SetupView";
import { RootState } from "../../store";

const mapStateToProps = (state: RootState) => {
  return {
    detectState: state.serial.detectState,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, SerialAction | WizardReduxAction>) => {
  return {
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

export default connect(mapStateToProps, mapDispatchToProps)(SetupView);
