/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormState } from './types';
import formActions, { ActionKey, ActionPayload } from './Actions';

class FormWorker {
  mutateState(
    action: ActionKey,
    payload: ActionPayload<ActionKey>,
    state: FormState
  ): FormState {
    const newState = { ...state };
    const actionCallback = formActions[action] as any; // ¯\_(ツ)_/¯

    return actionCallback(payload)(newState);
  }
}

export default FormWorker;
