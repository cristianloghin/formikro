import Global from '../core/Global';
import { useFormState, useFormStages, useFormController } from '.';

function useFormikroClient(formName: string) {
  const Form = Global.getForm(formName);
  const Client = Form.getClient();

  const isSubmittable = useFormState(Form);

  const stages = useFormStages(Form);

  const controller = useFormController(Client);

  return { isSubmittable, stages, controller };
}

export { useFormikroClient };
