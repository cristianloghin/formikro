import FormObject from '../core/FormObject';

export function useFieldStage(Form: FormObject, fieldId: string) {
  const Field = Form.getField(fieldId);

  return Field.stageId;
}
