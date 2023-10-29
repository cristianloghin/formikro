import { useRef, useState, useEffect, useCallback } from 'react';
import { Client } from '../core/Client';

export function useFormState(client: Client) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const [isSubmittable, setIsSubmittable] = useState(
    client.formState === 'SUBMITTABLE'
  );

  // set up an observer
  const formObserver = useCallback(() => {
    setIsSubmittable(client.formState === 'SUBMITTABLE');
  }, [client]);

  // subscribe to value change
  useEffect(() => {
    const observerId = uid.current;
    const action = 'SET_FORM_STATE';
    client.subscribe(action, formObserver, observerId);

    return () => client.unsubscribe(action, observerId);
  }, [client, formObserver]);

  return { isSubmittable };
}
