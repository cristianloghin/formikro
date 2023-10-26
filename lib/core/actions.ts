/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldState, StageState, FormState } from './StateManager';
import { FieldValue, FormData } from './types';

export type ActionKey = keyof typeof formActions;
export type ActionPayload<T extends ActionKey> = Parameters<
  (typeof formActions)[T]
>[0];

const formActions = {
  SET_FIELD_VALUE:
    ({ value, path }: { value: FieldValue; path: [string, string] }) =>
    (data: FormData) => {
      const Field = data.stages.get(path[0])?.fields.get(path[1]);
      if (Field) {
        Field.value = value;
      }

      return data;
    },
  SET_FIELD_STATE:
    ({ value, path }: { value: FieldState; path: [string, string] }) =>
    (data: FormData) => {
      const Field = data.stages.get(path[0])?.fields.get(path[1]);

      if (Field) {
        Field.currentState = value;
      }

      return data;
    },
  SET_STAGE_STATE:
    ({ value, path }: { value: StageState; path: string }) =>
    (data: FormData) => {
      const Stage = data.stages.get(path);
      if (Stage) {
        Stage.currentState = value;
      }
      return data;
    },
  SET_FORM_STATE:
    ({ value }: { value: FormState; path: undefined }) =>
    (data: FormData) => {
      data.currentState = value;
      return data;
    },
  SET_ACTIVE_STAGE:
    ({ value }: { value: string; path: undefined }) =>
    (data: FormData) => {
      const stageState = data.stages.get(value)!.currentState;
      data.currentStage = [value, stageState];

      return data;
    },
} as const;

export default formActions;
