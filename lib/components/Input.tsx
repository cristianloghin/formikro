import { FieldProps } from '../core/types';
import { useFieldValue, useFieldActions, useFieldState } from '../hooks';
import Form from '../core/Form';

export interface InputProps<T> extends FieldProps<T> {}

export function Input<T>(Form: Form, { id, label }: FieldProps<T>) {
  const { value, isRequired } = useFieldValue(Form, id);
  const state = useFieldState(Form, id);
  const handleInput = useFieldActions(Form, id);

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
          form={Form?.id}
          type='text'
          value={value || ''}
          onChange={handleInput}
        />
      </div>
    </div>
  );
}
