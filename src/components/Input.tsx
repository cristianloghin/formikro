import { DefaultFieldProps } from '../../lib/main';

export interface InputProps extends DefaultFieldProps {
  label?: string;
}

export function Input({
  id,
  formId,
  label,
  isRequired,
  value,
  state,
  error,
  handleChange,
}: // isDisabled,
InputProps) {
  return (
    <div style={{ marginTop: '1rem' }}>
      {label && (
        <label htmlFor={id}>
          {label}
          {isRequired && '*'}({state})
        </label>
      )}
      <div style={{ marginTop: '.3rem' }}>
        <input
          id={id}
          form={formId}
          type='text'
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          // disabled={isDisabled}
        />
        {/* {!isDisabled && error && (
          <span style={{ color: 'red', fontSize: '.75rem' }}>{error}</span>
        )} */}
        {error && (
          <span style={{ color: 'red', fontSize: '.75rem' }}>{error}</span>
        )}
      </div>
    </div>
  );
}
