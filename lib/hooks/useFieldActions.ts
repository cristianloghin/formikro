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

      debouncedValidation && debouncedValidation(e.target.value);
    },
    [client, id, uid, debouncedValidation]
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
