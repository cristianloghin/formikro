import FormObject from '../core/FormObject';
import { FieldProps } from '../core/types';
import { useFieldValue, useFieldActions } from '../hooks';

export interface SelectProps<T> extends FieldProps<T> {
  options: [label: string, value: string][];
}

export function Select<T>(
  Form: FormObject,
  { id, label, options }: SelectProps<T>
) {
  const { value: selectedValue, isRequired } = useFieldValue(Form, id);
  const handleChange = useFieldActions(Form, id);

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
