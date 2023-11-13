import Global from '../core/Global';
import { FieldData, FieldValue } from '../core/Field';
import { useCallback, useEffect, useState } from 'react';

export function useField(formId: string, fieldId: string) {
  const client = Global.getClient(formId);
  const [fieldData, setFieldData] = useState<Partial<FieldData>>();

  // set up an observer
  const fieldObserver = useCallback((field: Partial<FieldData>) => {
    setFieldData((current) => {
      if (current === field) {
        return current;
      }
      return field;
    });
  }, []);

  const fieldHandler = useCallback(
    (value: FieldValue) => {
      client.dispatchEvent({
        action: 'UPDATE_FIELD',
        fieldId,
        value,
      });
    },
    [client, fieldId]
  );

  useEffect(() => {
    const unsubscribe = client.subscribe(fieldId, fieldObserver);
    // get intial field data
    client.dispatchEvent({ action: 'INITIALIZE_FIELD', fieldId });

    return () => {
      unsubscribe();
    };
  }, [client, fieldId, fieldObserver]);

  return {
    isRequired: fieldData?.isRequired,
    value: fieldData?.value,
    handleChange: fieldHandler,
    state: fieldData?.currentState,
  };
}
