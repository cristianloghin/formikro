import FormState from '../core/State';

export function useFormDispatch(formId: string) {
  return (action, payload) => {
    const form = FormState.getForm(formId);
    if (form) {
      form.dispatch(action, payload);
    }
  };
}
