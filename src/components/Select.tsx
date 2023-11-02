import { DefaultProps } from '../../lib/components/Field';

export interface SelectProps extends DefaultProps {
  label?: string;
  options: [label: string, value: string][];
}

export function Select({
  id,
  formId,
  label,
  isRequired,
  value,
  handleChange,
  state,
  error,
  isDisabled,
  options = [],
}: SelectProps) {
  return (
    <div style={{ marginTop: '1rem' }}>
      {label && (
        <label htmlFor={id}>
          {label}
          {isRequired && '*'}({state})
        </label>
      )}
      <div style={{ marginTop: '.3rem' }}>
        <select
          form={formId}
          id={id}
          defaultValue={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isDisabled}
        >
          <option value=''>None</option>
          {options.map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {!isDisabled && error && (
          <span style={{ color: 'red', fontSize: '.75rem' }}>{error}</span>
        )}
      </div>
    </div>
  );
}
