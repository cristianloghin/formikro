import { useCallback } from 'react';
import FormObject from '../core/FormObject';
import { FieldProps } from '../core/types';
import { useFieldValue, useFieldStage } from '../hooks';

export interface SelectProps<T> extends FieldProps<T> {
  options: [label: string, value: string][];
}

export function Select<T>(
  Form: FormObject,
  { id, label, options }: SelectProps<T>
) {
  const selectedValue = useFieldValue(Form, id);
  const stageId = useFieldStage(Form, id);
  const handleChange = useSelect(Form, stageId, id);

  return (
    <div style={{ marginTop: '1rem' }}>
      {label && (
        <label htmlFor={id}>
          {label}
          {/* {isValid ? ' (valid)' : ' (invalid)'} */}
        </label>
      )}
      <div style={{ marginTop: '.3rem' }}>
        <select
          form={Form.id}
          id={id}
          defaultValue={selectedValue}
          onChange={handleChange}
        >
          <option value={undefined} hidden>
            Select a value...
          </option>
          {options.map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function useSelect(Form: FormObject, stageId: string, fieldId: string) {
  const dispatch = Form.dispatch;

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      dispatch(
        'SET_FIELD_VALUE',
        {
          fieldId,
          stageId,
          value: e.target.value,
        },
        [stageId, fieldId]
      ),
    [dispatch, stageId, fieldId]
  );

  return handleInput;
}
