import { useRef, useState, useEffect, useCallback } from 'react';
import Form from '../core/Form';
import { FieldValue, FormObserver } from '../core/types';

export function useFieldValue(Form: Form, fieldId: string) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const Field = Form.getField(fieldId);
  const [value, setValue] = useState<FieldValue>(Field.value);

  // set up an observer
  const fieldObserver = useCallback<FormObserver>(() => {
    setValue(Field.value);
  }, [Field]);

  // subscribe to value change
  useEffect(() => {
    const observerId = uid.current;
    const action = `SET_FIELD_VALUE:${Field.stageId}:${Field.id}`;
    Form.subscribe(action, fieldObserver, observerId);

    return () => Form?.unsubscribe(action, observerId);
  }, [Form, Field, fieldObserver]);

  return { value, isRequired: Field.isRequired };
}
