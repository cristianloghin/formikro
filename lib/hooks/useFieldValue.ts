import { useState, useEffect, useCallback } from 'react';
import { FieldValue } from '../core/Field';
import { Client } from '../core/Client';

export function useFieldValue(client: Client, fieldId: string) {
  const field = client.getField(fieldId);
  const uid = field?.uid;
  const [value, setValue] = useState<FieldValue>(field?.value);

  // set up an observer
  const fieldObserver = useCallback(() => {
    setValue((currentValue) => {
      if (currentValue === field?.value) {
        return currentValue;
      }
      return field?.value;
    });
  }, [field]);

  // subscribe to value change
  useEffect(() => {
    const action = `SET_FIELD_VALUE`;
    client.subscribe(action, fieldObserver, uid!);

    return () => client.unsubscribe(action, uid!);
  }, [client, field, fieldObserver, uid]);

  return {
    value,
    isRequired: field?.isRequired,
  };
}
