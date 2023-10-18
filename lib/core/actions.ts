import { FieldValue, FormState } from './Form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Actions extends Record<string, any> {
  // setFieldValue: (
  //   form: typeof Formikro,
  //   payload: { formId: string; fieldId: string; value: FieldValue }
  // ) => void;

  setFieldValue: (payload: {
    fieldId: string;
    value: FieldValue;
  }) => (state: FormState) => FormState;

  setFieldValid: (payload: {
    formId: string;
    fieldId: string;
    isValid: boolean;
  }) => (state: FormState) => FormState;

  registerStageFields: (payload: {
    formId: string;
    stageId: string;
    fields: Set<[string, boolean]>;
  }) => (state: FormState) => FormState;
}

// export type ActionPayloads = {
//   [K in keyof Actions]: Parameters<Actions[K]>[0];
// };

// export type PayloadType<T> = T extends { payload: infer P } ? P : never;

const actions: Actions = {
  // setFieldValue: (Form, payload) => {
  //   const { formId, fieldId, value } = payload;
  //   Form.set(formId, (state) => {
  //     const field = state.fields.get(fieldId);
  //     if (field) {
  //       field.value = value || undefined;
  //     }
  //     return [state, [[formId, fieldId]]];
  //   });
  // },

  setFieldValue:
    ({ fieldId, value }) =>
    (state) => {
      const field = state.fields.get(fieldId);
      if (field) {
        field.value = value || undefined;
      }
      return state;
    },

  setFieldValid:
    ({ formId, fieldId, isValid }) =>
    (state) => {
      // form.setFieldState(formId, fieldId, isValid);
      console.log(formId, fieldId, isValid);
      return state;
    },

  registerStageFields:
    ({ formId, stageId, fields }) =>
    (state) => {
      const observersSet: string[][] = [];
      fields.forEach(([fieldId, isValid]) => {
        state.fields.set(fieldId, {
          isValid,
          stageId,
          value: state.initialValues.get(fieldId) || undefined,
        });
        observersSet.push([formId, fieldId]);
      });
      return state;
    },
};

export default actions;
