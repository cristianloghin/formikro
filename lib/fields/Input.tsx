// import { useCallback, useEffect, useState, useRef } from 'react';
// import { FieldValue } from '../core/types';
import { FieldProps } from '../core/types';
// import { FormikroClass, Observer } from '../core/Form';

// import { Actions } from '../core/actions';
import { useFieldValue } from '../hooks';
import FormObject from '../core/FormObject';

export interface InputProps<T> extends FieldProps<T> {}

export function Input<T>(Form: FormObject, { id, label }: FieldProps<T>) {
  const value = useFieldValue(Form, id);

  // const handleInput = useInput(dispatch, [formId, id], required);
  // const { value, isValid } = useInputData(Form, formId, stageId, id);

  // const dispatch = useFormDispatch(formId);

  return (
    <div style={{ marginTop: '1rem' }}>
      {label && (
        <label htmlFor={id}>
          {label}
          {/* {isValid ? ' (valid)' : ' (invalid)'} */}
        </label>
      )}
      <div style={{ marginTop: '.3rem' }}>
        <input
          id={id}
          form={Form?.id}
          type='text'
          value={value || ''}
          onChange={() => {}}
          // onInput={handleInput}
          // onChange={(e) =>
          //   dispatch('setFieldValue', {
          //     stageId,
          //     fieldId: id,
          //     value: e.target.value,
          //   })
          // }
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

// function useInputData(
//   Form: FormikroClass,
//   formId: string,
//   stageId: string,
//   fieldId: string
// ) {
//   const observerId = useRef(Math.random().toString(36).substring(2, 8));
//   const [value, setValue] = useState<FieldValue>();
//   const [isValid, setIsValid] = useState<boolean>(false);

//   const fieldObserver = useCallback<Observer>(
//     (form) => {
//       // const fieldData = form.getField(formId, fieldId)!;
//       const fieldData = form.fields.get(fieldId)!;
//       setValue(fieldData.value);
//       setIsValid(fieldData.isValid);
//     },
//     [fieldId]
//   );

//   useEffect(() => {
//     const id = observerId.current;
//     Form.addObserver([formId, stageId, fieldId], [id, fieldObserver]);

//     return () => Form.removeObserver([formId, fieldId], id);
//   }, [Form, formId, stageId, fieldId, fieldObserver]);

//   return { value, isValid };
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
