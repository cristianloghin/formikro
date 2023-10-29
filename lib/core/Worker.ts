/* eslint-disable @typescript-eslint/no-explicit-any */
import formActions, { ActionData, ActionKey, ActionPayload } from './Actions';

export class Worker {
  mutateState(
    action: ActionKey,
    payload: ActionPayload<ActionKey>,
    data: ActionData
  ): ActionData {
    const actionCallback = formActions[action] as any; // ¯\_(ツ)_/¯
    return actionCallback(payload)(data);
  }
}
