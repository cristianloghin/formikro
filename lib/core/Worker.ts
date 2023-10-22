import { FieldValue } from './State';
import { FormState } from './types';

export const FORM_ACTIONS = {
  SET_FIELD_VALUE:
    ({
      stageId,
      fieldId,
      value,
    }: {
      stageId: string;
      fieldId: string;
      value: FieldValue;
    }) =>
    (state: FormState) => {
      const Field = state.stages.get(stageId)?.fields.get(fieldId);
      if (Field) {
        Field.value = value;
        console.log(Field);
        if (Field.sideEffects) {
          console.log('Run Side Effects', Field.sideEffects);
        }
      }
      return state;
    },
} as const;

class FormWorker {
  mutateState<ActionType extends keyof typeof FORM_ACTIONS>(
    action: ActionType,
    payload: Parameters<(typeof FORM_ACTIONS)[ActionType]>[0],
    state: FormState
  ): FormState {
    const newState = { ...state };
    return FORM_ACTIONS[action](payload)(newState);
  }
}

export default FormWorker;
