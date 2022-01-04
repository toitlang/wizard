import {
  FlashingProperties,
  UPDATE_CURRENT_ACTION,
  UPDATE_FLASHING_PROPERTIES,
  UPDATE_SHOW_QUESTIONNAIRE,
  WizardAction,
  WizardError,
  WizardReduxAction,
} from "../actions/wizard";

export type WizardState = {
  readonly currentAction: WizardAction | WizardError;
  readonly flashingProperties?: FlashingProperties;
  readonly showQuestionnaire: boolean;
};

export const initialWizardState: WizardState = {
  currentAction: WizardAction.CONNECT,
  showQuestionnaire: false,
};

export default function (state: WizardState = initialWizardState, action: WizardReduxAction): WizardState {
  switch (action.type) {
    case UPDATE_FLASHING_PROPERTIES:
      return {
        ...state,
        flashingProperties: action.payload.flashingProperties,
      };
    case UPDATE_CURRENT_ACTION:
      return {
        ...state,
        currentAction: action.payload.currentAction,
      };
    case UPDATE_SHOW_QUESTIONNAIRE:
      return {
        ...state,
        showQuestionnaire: action.payload.showQuestionnaire,
      };
    default:
      return state;
  }
}
