import { useCallback } from 'react';
import FormObject from '../core/FormObject';
import { FieldValue } from '../core/types';

type Elements = HTMLInputElement | HTMLSelectElement;

export function useFieldActions(Form: FormObject, fieldId: string) {
  const dispatch = Form.dispatch;
  const { stageId, isRequired } = Form.getField(fieldId);

  const validate = useCallback(
    (value: FieldValue) => {
      const debouncedValidate = debounce(() => {
        if (!value && isRequired) {
          // dispatch('setFieldValid', { isValid: false });
          console.log('INVALID');
        } else {
          // dispatch('setFieldValid', { isValid: true });
          console.log('VALID');
        }
      }, 400);

      debouncedValidate();
    },
    [isRequired]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<Elements>) => {
      dispatch(
        'SET_FIELD_VALUE',
        {
          fieldId,
          stageId,
          value: e.target.value,
        },
        [stageId, fieldId]
      );
      validate(e.target.value);
    },
    [dispatch, validate, stageId, fieldId]
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
