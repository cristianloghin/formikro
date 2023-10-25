/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FieldState,
  StageState,
  FormState as FormStateType,
} from './StateManager';
import { FieldValue, FormState } from './types';

export type ActionKey = keyof typeof formActions;
export type ActionPayload<T extends ActionKey> = Parameters<
  (typeof formActions)[T]
>[0];

const formActions = {
  SET_FIELD_VALUE:
    ({ value, path }: { value: FieldValue; path: [string, string] }) =>
    (state: FormState) => {
      const Field = state.stages.get(path[0])?.fields.get(path[1]);
      if (Field) {
        Field.value = value;
      }

      return state;
    },
  SET_FIELD_STATE:
    ({ value, path }: { value: FieldState; path: [string, string] }) =>
    (state: FormState) => {
      const Field = state.stages.get(path[0])?.fields.get(path[1]);

      if (Field) {
        Field.currentState = value;
      }

      return state;
    },
  SET_STAGE_STATE:
    ({ value, path }: { value: StageState; path: string }) =>
    (state: FormState) => {
      const Stage = state.stages.get(path);
      if (Stage) {
        Stage.currentState = value;
      }
      return state;
    },
  SET_FORM_STATE:
    ({ value }: { value: FormStateType; path: undefined }) =>
    (state: FormState) => {
      state.currentState = value;
      return state;
    },
} as const;

export default formActions;
