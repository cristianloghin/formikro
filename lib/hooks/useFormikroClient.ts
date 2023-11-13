import { useCallback } from 'react';
import Global from '../core/Global';

function useFormikroClient(formName: string) {
  const client = Global.getClient(formName);

  const submitForm = useCallback(() => {
    client.dispatchEvent({
      action: 'SUBMIT_FORM',
    });
  }, [client]);

  return { submit: submitForm };
}

export { useFormikroClient };
