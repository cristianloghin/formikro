import { useState, useEffect, useCallback } from 'react';
import { FieldValue } from '../core/__types';
import { Client } from '../core/Client';

export function useFieldValue(client: Client, fieldId: string) {
  const field = client.getField(fieldId);
  const uid = field?.uid;
  const [value, setValue] = useState<FieldValue>(field?.value);

  // set up an observer
  const fieldObserver = useCallback(() => {
    setValue(field?.value);
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
