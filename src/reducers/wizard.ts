// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.
import {
  FlashingProperties,
  UPDATE_CURRENT_ACTION,
  UPDATE_FLASHING_PROPERTIES,
  WizardAction,
  WizardError,
  WizardReduxAction,
} from "../actions/wizard";

export type WizardState = {
  readonly currentAction: WizardAction | WizardError;
  readonly flashingProperties?: FlashingProperties;
};

export const initialWizardState: WizardState = {
  currentAction: WizardAction.CONNECT,
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
    default:
      return state;
  }
}
