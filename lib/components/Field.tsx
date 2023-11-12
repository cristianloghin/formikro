import React from 'react';
import Global from '../core/Global';
import { FieldState } from '../core/StateManager';
import { useFieldValue, useFieldActions, useFieldState } from '../hooks';
import { FieldValue } from '../main';

export interface DefaultFieldProps {
  id: string;
  formId: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  value: FieldValue;
  handleChange: (value: FieldValue) => void;
  state?: FieldState;
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
  const client = Global.getClient(formId);
  const { value, isRequired, isDisabled } = useFieldValue(client, id);
  const { currentState, error } = useFieldState(client, id);
  const handleChange = useFieldActions(client, id);

  return props.render({
    id,
    formId,
    isRequired,
    isDisabled,
    value,
    handleChange,
    state: currentState,
    error,
  });
}
