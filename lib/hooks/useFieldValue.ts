import { useState, useEffect, useCallback } from 'react';
import { Field, FieldValue } from '../core/Field';
import { Client } from '../core/Client';

export function useFieldValue(client: Client, fieldId: string) {
  const [value, setValue] = useState<FieldValue>();
  const [isRequired, setIsRequired] = useState<boolean>();
  const [isDisabled, setIsDisabled] = useState<boolean>();

  // set up an observer
  const fieldObserver = useCallback((field: Field) => {
    setValue((currentValue) => {
      if (currentValue === field.value) {
        return currentValue;
      }
      return field.value;
    });

    setIsDisabled((current) => {
      if (current === field.isDisabled) {
        return current;
      }

      return field.isDisabled;
    });

    setIsRequired((current) => {
      if (current === field.isRequired) {
        return current;
      }

      return field.isRequired;
    });
  }, []);

  // subscribe to value change
  useEffect(() => {
    const unsubscribe = client.subscribe(fieldId, fieldObserver);

    return () => {
      unsubscribe();
    };
  }, [client, fieldId, fieldObserver]);

  return {
    value,
    isRequired,
    isDisabled,
  };
}
