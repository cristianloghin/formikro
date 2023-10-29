/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field, FieldValue } from './Field';
import { Form, FormType } from './Form';
import { FieldState, FormState } from './StateManager';

export type ActionKey = keyof typeof formActions;
export type ActionPayload<T extends ActionKey> = Parameters<
  (typeof formActions)[T]
>[0];

export type ActionData = {
  currentState: FormState;
  fields: Map<string, Field>;
};

const formActions = {
  SET_FIELD_VALUE:
    ({ id, value }: { id: string; value: FieldValue }) =>
    (data: ActionData) => {
      const field = data.fields.get(id);
      if (field) {
        field.value = value;
      }
      return data;
    },
  SET_FIELD_STATE:
    ({ id, state }: { id: string; state: FieldState }) =>
    (data: ActionData) => {
      const field = data.fields.get(id);

      if (field) {
        field.currentState = state;
      }

      return data;
    },
  // SET_STAGE_STATE:
  //   ({ value, path }: { value: StageState; path: string }) =>
  //   (data: FormData) => {
  //     const Stage = data.stages.get(path);
  //     if (Stage) {
  //       Stage.currentState = value;
  //     }
  //     return data;
  //   },
  SET_FORM_STATE:
    ({ state }: { state: FormState }) =>
    (data: ActionData) => {
      data.currentState = state;
      return data;
    },
  // SET_ACTIVE_STAGE:
  //   ({ value }: { value: string; path: undefined }) =>
  //   (data: FormData) => {
  //     const stageState = data.stages.get(value)!.currentState;
  //     data.currentStage = [value, stageState];

  //     return data;
  //   },
  SET_FORM: (payload: Partial<Form>) => (form: FormType) => {
    console.log(payload, form);
  },
} as const;

export default formActions;
