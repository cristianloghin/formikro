import { FieldProps } from '../core/types';
import { useFieldValue, useFieldActions } from '../hooks';
import FormObject from '../core/FormObject';

export interface InputProps<T> extends FieldProps<T> {}

export function Input<T>(Form: FormObject, { id, label }: FieldProps<T>) {
  const { value, isRequired } = useFieldValue(Form, id);
  const handleInput = useFieldActions(Form, id);

  return (
    <div style={{ marginTop: '1rem' }}>
      {label && (
        <label htmlFor={id}>
          {label}
          {isRequired && '*'}
          {/* {isValid ? ' (valid)' : ' (invalid)'} */}
        </label>
      )}
      <div style={{ marginTop: '.3rem' }}>
        <input
          id={id}
          form={Form?.id}
          type='text'
          value={value || ''}
          onChange={handleInput}
        />
      </div>
    </div>
  );
}

// function useInput(
//   dispatch: (path: string[], action: keyof Actions, payload: unknown) => void,
//   path: string[],
//   required: boolean
// ) {
//   const validate = useCallback(
//     (value: FieldValue, isRequired: boolean) => {
//       const debouncedValidate = debounce(
//         (value: FieldValue, isRequired: boolean) => {
//           if (!value && isRequired) {
//             dispatch(path, 'setFieldValid', { isValid: false });
//           } else {
//             dispatch(path, 'setFieldValid', { isValid: true });
//           }
//         },
//         400
//       );

//       debouncedValidate(value, isRequired);
//     },

//     [dispatch, path]
//   );

//   const handleInput: React.FormEventHandler<HTMLInputElement> = useCallback(
//     (e) => {
//       const target = e.target as HTMLInputElement;
//       const value = target.value;

//       dispatch(path, 'setFieldValue', { value });

//       validate(value, required);
//     },
//     [dispatch, path, required, validate]
//   );

//   return handleInput;
// }

/* UTILS */

// function debounce<F extends (...args: never[]) => void>(
//   func: F,
//   wait: number
// ): (...args: Parameters<F>) => void {
//   let timeoutID: ReturnType<typeof setTimeout>;

//   return (...args: Parameters<F>): void => {
//     if (timeoutID) {
//       clearTimeout(timeoutID);
//     }

//     timeoutID = setTimeout(() => func(...args), wait);
//   };
// }
