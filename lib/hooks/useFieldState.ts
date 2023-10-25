import { useRef, useState, useEffect, useCallback } from 'react';
import Form from '../core/Form';
import { FormObserver } from '../core/types';
import { FieldState } from '../core/StateManager';

export function useFieldState(Form: Form, fieldId: string) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const Field = Form.getField(fieldId);
  const [state, setState] = useState<FieldState>(Field.currentState);

  // set up an observer
  const fieldObserver = useCallback<FormObserver>(() => {
    setState(Field.currentState);
  }, [Field]);

  // subscribe to value change
  useEffect(() => {
    const observerId = uid.current;
    const action = `SET_FIELD_STATE:${Field.stageId}:${Field.id}`;
    Form.subscribe(action, fieldObserver, observerId);

    return () => Form?.unsubscribe(action, observerId);
  }, [Form, Field, fieldObserver]);

  return state;
}
