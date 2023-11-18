import { useCallback, useEffect, useMemo, useState } from 'react';
import Global from '../core/Global';
import { FormData } from '../core/Form';
import { FormObserver } from '../core/Observer';
import { deepEqual, generateUID } from '.';

const observerUID = generateUID();

export function useFormikroClient<T>(formId: string) {
  const client = Global.getClient(formId);
  const [formData, setFormData] = useState<FormData<T>>();

  // create a form observer
  const formObserver = useMemo(
    () =>
      new FormObserver((data) => {
        setFormData((current) => {
          if (deepEqual(current, data)) {
            return current;
          }

          return data;
        });
      }),
    []
  );

  // submit form handler
  const submitForm = useCallback(() => {
    client.dispatchEvent({
      type: 'SUBMIT_FORM',
    });
  }, [client]);

  useEffect(() => {
    const unsubscribe = client.subscribe(formId, observerUID, formObserver);
    // get initial form state
    client.dispatchEvent({ type: 'REQUEST_FORM_DATA' });

    return () => {
      unsubscribe();
    };
  }, [client, formId, formObserver]);

  return {
    submit: submitForm,
    canSubmit: formData?.currentState === 'SUBMITTABLE',
    fields: formData?.fields,
  };
}
