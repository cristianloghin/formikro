import { FieldProps } from '../core/types';
import { Client } from '../core/Client';
import { useFieldValue, useFieldActions, useFieldState } from '../hooks';
// import { useField } from '../hooks';

export interface InputProps<T> extends FieldProps<T> {}

export function Input<T>(client: Client, { id, label }: FieldProps<T>) {
  const { value, isRequired } = useFieldValue(client, id);
  const currentState = useFieldState(client, id);
  const handleInput = useFieldActions(client, id);

  // const { state, controller } = useField(client, id);

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
        />
      </div>
    </div>
  );
}
