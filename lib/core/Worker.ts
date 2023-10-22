import FieldObject from './FieldObject';
import FormObject from './FormObject';
import { FieldValue } from './State';

export const FORM_ACTIONS = {
  setFieldValue:
    ({
      stageId,
      fieldId,
      value,
    }: {
      stageId: string;
      fieldId: string;
      value: FieldValue;
    }) =>
    (form: FormObject) => {
      const field = form.stages.get(stageId)?.fields.get(fieldId);
      if (field) {
        console.log('Set value:', value, 'on:', fieldId);
        field.value = value;
      }
    },
} as const;

interface Worker {
  mutateState<ActionType extends keyof typeof FORM_ACTIONS>(
    action: ActionType,
    payload: Parameters<(typeof FORM_ACTIONS)[ActionType]>[0],
    form: FormObject
  ): FormObject;
}

class FormWorker implements Worker {
  mutateState<ActionType extends keyof typeof FORM_ACTIONS>(
    action: ActionType,
    payload: Parameters<(typeof FORM_ACTIONS)[ActionType]>[0],
    form: FormObject
  ): FormObject {
    const newForm = { ...form };

    FORM_ACTIONS[action](payload)(newForm);

    return newForm;
  }
}

export default FormWorker;
