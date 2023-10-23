import { FieldValue } from './State';
import { FormState } from './types';

type FieldData = {
  stageId: string;
  fieldId: string;
  value: FieldValue;
};

const formActions = {
  SET_FIELD_VALUE:
    ({ stageId, fieldId, value }: FieldData) =>
    (state: FormState) => {
      const Field = state.stages.get(stageId)?.fields.get(fieldId);
      if (Field) {
        Field.value = value;
      }
      return state;
    },
  SET_FIELD_STATE:
    ({ stageId, fieldId }: FieldData) =>
    (state: FormState) => {
      const Field = state.stages.get(stageId)?.fields.get(fieldId);
      console.log(Field);
      // validate required
      return state;
    },
} as const;

export default formActions;
