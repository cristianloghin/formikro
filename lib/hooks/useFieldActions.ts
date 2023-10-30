import { useCallback, useMemo } from 'react';
import { Client } from '../core/Client';

type Elements = HTMLInputElement | HTMLSelectElement;

export function useFieldActions(client: Client, id: string) {
  const field = client.getField(id);
  const uid = field?.uid;
  const validate = field?.validate;

  const debouncedValidation = useMemo(() => {
    if (validate) return debounce(validate, 800);
  }, [validate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<Elements>) => {
      client.dispatch(
        'SET_FIELD_VALUE',
        {
          id,
          value: e.target.value,
        },
        uid
      );

      if (field?.sideEffects) {
        const { clear, validate } = field.sideEffects;
        if (clear) {
          clear.forEach((id) => {
            const target = client.getField(id);
            client.dispatch(
              'SET_FIELD_VALUE',
              { id, value: undefined },
              target?.uid
            );
            target?.validate();
          });
        }

        if (validate) {
          validate.forEach((id) => {
            const target = client.getField(id);
            target?.validate();
          });
        }
      }

      debouncedValidation && debouncedValidation();
    },
    [client, id, uid, field, debouncedValidation]
  );

  return handleChange;
}

function debounce<F extends (...args: never[]) => void>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeoutID: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): void => {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    timeoutID = setTimeout(() => func(...args), wait);
  };
}
