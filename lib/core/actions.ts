/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field, FieldValue } from './Field';
import { Form, FormType } from './Form';
import { Stage } from './Stage';
import { FieldState, FormState, StageState } from './StateManager';

export type ActionKey = keyof typeof formActions;
export type ActionPayload<T extends ActionKey> = Parameters<
  (typeof formActions)[T]
>[0];

export type ActionData = {
  currentState: FormState;
  fields: Map<string, Field>;
  stages?: Map<string, Stage>;
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
  SET_STAGE_STATE:
    ({ id, state }: { id: string; state: StageState }) =>
    (data: ActionData) => {
      const stage = data.stages?.get(id);
      if (stage) {
        stage.currentState = state;
      }
      return data;
    },
  SET_FORM_STATE:
    ({ state }: { state: FormState }) =>
    (data: ActionData) => {
      data.currentState = state;
      return data;
    },
  SET_ACTIVE_STAGE:
    ({ current, active }: { current: string; active: string }) =>
    (data: ActionData) => {
      const currentStage = data.stages?.get(current);
      const activeStage = data.stages?.get(active);

      if (currentStage && activeStage) {
        currentStage.isActive = false;
        activeStage.isActive = true;
      }

      return data;
    },
  SET_FORM: (payload: Partial<Form>) => (form: FormType) => {
    console.log(payload, form);
  },
} as const;

export default formActions;
