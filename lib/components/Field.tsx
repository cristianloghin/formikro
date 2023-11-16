import React from 'react';
import { useField } from '../hooks';
import { FieldValue } from '../main';
import { FieldState } from '../core/StateManager';

export interface DefaultFieldProps {
  id: string;
  formId: string;
  isRequired?: boolean;
  value: FieldValue;
  handleChange: (value: FieldValue) => void;
  state: FieldState | undefined;
  error?: string;
}

export interface FieldProps<
  T,
  K extends React.FC<DefaultFieldProps> = React.FC<DefaultFieldProps>
> {
  id: Extract<keyof T, string>;
  render: K;
}

export function Field<T>(formId: string, props: FieldProps<T>) {
  const { id } = props;
  const {
    isRequired,
    value,
    handleChange,
    currentState: state,
    error,
  } = useField(formId, id);

  return props.render({
    id,
    formId,
    isRequired,
    value,
    handleChange,
    state,
    error,
  });
}
