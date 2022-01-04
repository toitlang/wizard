export const UPDATE_CURRENT_ACTION = "UPDATE_CURRENT_ACTION";
export const UPDATE_FLASHING_PROPERTIES = "UPDATE_FLASHING_PROPERTIES";
export const UPDATE_INSTALL_TYPE = "UPDATE_INSTALL_TYPE";
export const UPDATE_SHOW_QUESTIONNAIRE = "UPDATE_SHOW_QUESTIONNAIRE";

export enum WizardAction {
  CONNECT = 1,
  SETUP = 2,
  FLASH = 3,
  DONE = 4,
}

export interface FlashingProperties {
  ssid: string;
  password: string;
  firmware: string;
  autoClaim: boolean;
  model: string;
}

export enum WizardErrorType {
  //CONNECT AND DETECT
  UNKNOWN_ERR = "Contact support",
  CREATE_PARTITION_ERR = "Create partition error",
  //Flash and reinstall
  FLASH_ERR = "Failed to flash",
  //Claim
  CLAIM_ERR = "Failed to claim",
  SERIAL_NOT_SUPPORT = "Serial not supported",
}

export interface WizardError {
  type: WizardErrorType;
  error: unknown;
  metadata?: unknown;
}

export type UpdateCurrentAction = {
  type: typeof UPDATE_CURRENT_ACTION;
  payload: { currentAction: WizardAction | WizardError };
};

export const updateCurrentAction = (currentAction: WizardAction | WizardError): UpdateCurrentAction => ({
  type: UPDATE_CURRENT_ACTION,
  payload: { currentAction: currentAction },
});

export type UpdateFlashingProperties = {
  type: typeof UPDATE_FLASHING_PROPERTIES;
  payload: { flashingProperties: FlashingProperties };
};

export const updateFlashingProperties = (flashingProperties: FlashingProperties): UpdateFlashingProperties => ({
  type: UPDATE_FLASHING_PROPERTIES,
  payload: { flashingProperties: flashingProperties },
});

export type UpdateShowQuestionnaire = {
  type: typeof UPDATE_SHOW_QUESTIONNAIRE;
  payload: { showQuestionnaire: boolean };
};

export const updateShowQuestionnaire = (showQuestionnaire: boolean): UpdateShowQuestionnaire => ({
  type: UPDATE_SHOW_QUESTIONNAIRE,
  payload: { showQuestionnaire: showQuestionnaire },
});

export type WizardReduxAction = UpdateCurrentAction | UpdateFlashingProperties | UpdateShowQuestionnaire;
