import { FieldProps } from '.';
import { Client } from '../core/Client';
import { useFieldValue, useFieldActions, useFieldState } from '../hooks';

export interface InputProps<T> extends FieldProps<T> {}

export function Input<T>(client: Client, { id, label }: FieldProps<T>) {
  const { value, isRequired } = useFieldValue(client, id);
  const { currentState, error } = useFieldState(client, id);
  const handleInput = useFieldActions(client, id);

  return (
    <div style={{ marginTop: '1rem' }}>
      {label && (
        <label htmlFor={id}>
          {label}
          {isRequired && '*'}({currentState})
        </label>
      )}
      <div style={{ marginTop: '.3rem' }}>
        <input
          id={id}
          form={client.formId}
          type='text'
          value={value || ''}
          onChange={handleInput}
          // disabled={isDisabled}
        />
        {error && (
          <span style={{ color: 'red', fontSize: '.75rem' }}>{error}</span>
        )}
      </div>
    </div>
  );
}
