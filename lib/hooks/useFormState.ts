import { useRef, useState, useEffect, useCallback } from 'react';
import Form from '../core/Form';
import { FormObserver } from '../core/types';

export function useFormState(Form: Form) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const [isSubmittable, setIsSubmittable] = useState(
    Form.state.currentState === 'SUBMITTABLE'
  );

  // set up an observer
  const formObserver = useCallback<FormObserver>(() => {
    setIsSubmittable(Form.state.currentState === 'SUBMITTABLE');
  }, [Form]);

  // subscribe to value change
  useEffect(() => {
    const observerId = uid.current;
    const action = 'SET_FORM_STATE';
    Form.subscribe(action, formObserver, observerId);

    return () => Form?.unsubscribe(action, observerId);
  }, [Form, formObserver]);

  return isSubmittable;
}
