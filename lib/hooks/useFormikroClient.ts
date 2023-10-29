import Global from '../core/Global';
import { useFormState, useFormController, useFormStage } from '.';

function useFormikroClient(formName: string) {
  const form = Global.getForm(formName);
  const client = form.getClient();

  const { isSubmittable } = useFormState(client);
  const stage = useFormStage(client);

  const controller = useFormController(client);

  // const { isSubmittable } = useForm(client);

  // return { isSubmittable, stages, controller };

  return { isSubmittable, stage, controller };
}

export { useFormikroClient };
