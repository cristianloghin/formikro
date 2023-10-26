/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';
import formActions, { ActionKey, ActionPayload } from './Actions';

class FormWorker {
  mutateState(
    action: ActionKey,
    payload: ActionPayload<ActionKey>,
    data: FormData
  ): FormData {
    const newState = { ...data };
    const actionCallback = formActions[action] as any; // ¯\_(ツ)_/¯

    return actionCallback(payload)(newState);
  }
}

export default FormWorker;
