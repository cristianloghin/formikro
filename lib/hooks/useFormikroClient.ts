import Global from '../core/Global';
import { useFormState } from '.';
// import { useFormStages, useFormController } from '.';

function useFormikroClient(formName: string) {
  const form = Global.getForm(formName);
  const client = form.getClient();

  const { isSubmittable } = useFormState(client);

  // const stages = useFormStages(form);

  // const controller = useFormController(client);

  // const { isSubmittable } = useForm(client);

  // return { isSubmittable, stages, controller };

  return { isSubmittable };
}

export { useFormikroClient };
