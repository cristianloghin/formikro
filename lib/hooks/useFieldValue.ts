import { useRef, useState, useEffect, useCallback } from 'react';
import FormObject from '../core/FormObject';
import { FieldValue, FormObserver } from '../core/types';
// import FieldObject from '../core/FieldObject';

export function useFieldValue(Form: FormObject, fieldId: string) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const [value, setValue] = useState<FieldValue>();

  // set up an observer
  const fieldObserver = useCallback<FormObserver>(
    (form) => {
      const Field = form.getField(fieldId);
      if (Field) {
        setValue(Field.value);
      }
    },
    [fieldId]
  );

  // subscribe to state
  useEffect(() => {
    const observerId = uid.current;
    const Field = Form.getField(fieldId);

    setValue(Field.value);

    const action = `SET_FIELD_VALUE:${Field.stageId}:${Field.id}`;
    Form.subscribe(action, fieldObserver, observerId);

    return () => Form?.unsubscribe(observerId);
  }, [Form, fieldId, fieldObserver]);

  return value;
}
