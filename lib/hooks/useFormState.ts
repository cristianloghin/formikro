import { useRef, useState, useEffect, useCallback } from 'react';
import { Client } from '../core/Client';

export function useFormState(client: Client) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const [isSubmittable, setIsSubmittable] = useState(
    client.formState === 'SUBMITTABLE'
  );
  const [isSubmitting, setIsSubmitting] = useState(
    client.formState === 'SUBMITTING'
  );
  const [success, setSuccess] = useState(client.formState === 'SUCCESS');
  const [error, setError] = useState(client.formState === 'ERROR');

  // set up an observer
  const formObserver = useCallback(() => {
    setIsSubmittable(client.formState === 'SUBMITTABLE');

    setIsSubmitting((current) => {
      const isSubmitting = client.formState === 'SUBMITTING';

      if (current === isSubmitting) {
        return current;
      }
      return isSubmitting;
    });

    setSuccess((current) => {
      const success = client.formState === 'SUCCESS';

      if (current === success) {
        return current;
      }

      return success;
    });

    setError((current) => {
      const error = client.formState === 'ERROR';

      if (current === error) {
        return current;
      }

      return error;
    });
  }, [client]);

  // subscribe to value change
  useEffect(() => {
    const observerId = uid.current;
    const action = 'SET_FORM_STATE';
    client.subscribe(action, formObserver, observerId);

    return () => client.unsubscribe(action, observerId);
  }, [client, formObserver]);

  return { isSubmittable, isSubmitting, success, error };
}
