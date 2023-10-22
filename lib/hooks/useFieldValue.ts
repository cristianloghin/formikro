import { useRef, useState, useEffect, useCallback } from 'react';
import FormObject from '../core/FormObject';
import { FieldValue, FormObserver } from '../core/types';

export function useFieldValue(Form: FormObject, fieldId: string) {
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

  return value;
}
