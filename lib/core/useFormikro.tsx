/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback, useRef } from 'react';
import Form, { FieldValue, FormOptions, Observer } from './Form';
import { Actions } from './actions';
import { Input } from '../fields/Input';
import { Stage, StageProps } from '../fields/Stage';

export interface FieldProps<T> {
  id: Extract<keyof T, string>;
  stageId?: string;
  label?: string;
  required?: boolean;
}

export interface FormikroForm<T extends Record<string, FieldValue>>
  extends React.FC<React.PropsWithChildren> {
  Input: React.FC<FieldProps<T>>;
  Stage: React.FC<StageProps>;
}

export function useFormikro<T extends Record<string, FieldValue>>(
  formId: string,
  options: FormOptions<T>
): FormikroForm<T> {
  const optionsRef = useRef<FormOptions<T>>();
  const stagesRef = useRef(options.stages);

  useFormObserver(formId);

  const dispatch = useCallback(
    (path: string[], action: keyof Actions, payload: any) => {
      Form.dispatch(path, action, payload);
    },
    []
  );

  useEffect(() => {
    if (optionsRef.current !== options) {
      Form.addForm<T>(formId, options);
    }
    optionsRef.current = options;
  }, [formId, options]);

  const DynamicForm = useCallback<React.FC<React.PropsWithChildren>>(
    ({ children }) => {
      return (
        <form id={formId} onSubmit={(e) => e.preventDefault()}>
          {stagesRef.current
            ? children
            : Stage(dispatch, formId, { name: 'DEFAULT', children })}
        </form>
      );
    },
    [dispatch, formId]
  );

  const ComposedForm = DynamicForm as FormikroForm<T>;

  ComposedForm.Input = useCallback(
    (props) => Input(dispatch, formId, props),
    [dispatch, formId]
  );

  ComposedForm.Stage = useCallback(
    (props) => Stage(dispatch, formId, props),
    [dispatch, formId]
  );

  return ComposedForm;
}

function useFormObserver(formId: string) {
  const observerId = useRef(Math.random().toString(36).substring(2, 8));
  const formObserver = useCallback<Observer>(
    (state) => {
      console.log('Form observer id', formId, state);
    },
    [formId]
  );

  useEffect(() => {
    const id = observerId.current;
    Form.addObserver([formId], [id, formObserver]);

    return () => Form.removeObserver([formId], id);
  }, [formId, formObserver]);
}
