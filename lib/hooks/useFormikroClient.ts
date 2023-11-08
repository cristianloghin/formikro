import Global from '../core/Global';
import { useFormState, useFormController, useFormStage } from '.';
import { FieldValue } from '../core/Field';

function useFormikroClient<T extends Record<string, FieldValue>>(
  formName: string
) {
  const form = Global.getForm(formName);
  const client = form.getClient();

  const state = useFormState(client);
  const stage = useFormStage(client);

  const controller = useFormController(client);

  const fields = client.fields as T;

  // return { data, state, controller }

  return { state: { ...state, stage }, controller, fields };
}

export { useFormikroClient };
