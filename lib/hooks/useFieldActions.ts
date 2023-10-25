import { useCallback, useMemo } from 'react';
import FormObject from '../core/FormObject';

type Elements = HTMLInputElement | HTMLSelectElement;

export function useFieldActions(Form: FormObject, fieldId: string) {
  const dispatch = Form.dispatch;
  const { stageId, validate } = Form.getField(fieldId);

  const debouncedValidation = useMemo(() => {
    return debounce(validate, 800);
  }, [validate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<Elements>) => {
      dispatch('SET_FIELD_VALUE', {
        value: e.target.value,
        path: [stageId, fieldId],
      });

      debouncedValidation(e.target.value);
    },
    [dispatch, debouncedValidation, stageId, fieldId]
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
