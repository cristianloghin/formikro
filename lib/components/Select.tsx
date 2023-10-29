import { Client } from '../core/Client';
import { FieldProps } from '../core/types';
import { useFieldValue, useFieldActions } from '../hooks';

export interface SelectProps<T> extends FieldProps<T> {
  options: [label: string, value: string][];
}

export function Select<T>(
  clientInstance: Client,
  { id, label, options }: SelectProps<T>
) {
  const {
    value: selectedValue,
    formId,
    isRequired,
  } = useFieldValue(clientInstance, id);
  const handleChange = useFieldActions(clientInstance, id);

  return (
    <div style={{ marginTop: '1rem' }}>
      {label && (
        <label htmlFor={id}>
          {label}
          {isRequired && '*'}
        </label>
      )}
      <div style={{ marginTop: '.3rem' }}>
        <select
          form={formId}
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
