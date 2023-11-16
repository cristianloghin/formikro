import { useCallback, useEffect, useMemo, useState } from 'react';
import { deepEqual, generateUID } from '.';
import Global from '../core/Global';
import { FieldObserver } from '../core/Observer';
import { FieldData, FieldValue } from '../core/Field';

const observerUID = generateUID();

export function useField(formId: string, fieldId: string) {
  const client = Global.getClient(formId);
  const [fieldData, setFieldData] = useState<FieldData>();

  // set up a field observer
  const fieldObserver = useMemo(
    () =>
      new FieldObserver((data) => {
        setFieldData((current) => {
          if (deepEqual(current, data)) {
            return current;
          }

          return data;
        });
      }),
    []
  );

  const handleChange = useCallback(
    (value: FieldValue) => {
      client.dispatchEvent({
        type: 'SET_FIELD_VALUE',
        fieldId,
        value,
      });
    },
    [client, fieldId]
  );

  useEffect(() => {
    console.log(observerUID);
    const unsubscribe = client.subscribe(fieldId, observerUID, fieldObserver);
    // get intial field data
    client.dispatchEvent({ type: 'REQUEST_FIELD_DATA', fieldId });

    return () => {
      unsubscribe();
    };
  }, [client, fieldId, fieldObserver]);

  return {
    ...fieldData,
    handleChange,
  };
}
