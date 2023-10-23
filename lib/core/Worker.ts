import { FormState } from './types';
import formActions from './actions';

class FormWorker {
  mutateState<ActionType extends keyof typeof formActions>(
    action: ActionType,
    payload: Parameters<(typeof formActions)[ActionType]>[0],
    state: FormState
  ): FormState {
    const newState = { ...state };
    return formActions[action](payload)(newState);
  }
}

export default FormWorker;
