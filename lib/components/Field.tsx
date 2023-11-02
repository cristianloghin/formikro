/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Client } from '../core/Client';
import { FieldState } from '../core/StateManager';
import { useFieldValue, useFieldActions, useFieldState } from '../hooks';
import { FieldValue } from '../main';

export interface DefaultProps {
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
  K extends React.FC<DefaultProps> = React.FC<DefaultProps>
> {
  id: Extract<keyof T, string>;
  render: K;
}

export function Field<T>(client: Client, props: FieldProps<T>) {
  const { id } = props;
  const { value, isRequired, isDisabled } = useFieldValue(client, id);
  const { currentState, error } = useFieldState(client, id);
  const handleChange = useFieldActions(client, id);

  return props.render({
    id,
    formId: client.formId,
    isRequired,
    isDisabled,
    value,
    handleChange,
    state: currentState,
    error,
  });
}
