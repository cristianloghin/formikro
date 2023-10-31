import { useCallback } from 'react';
import Global from '../core/Global';
import { FieldValue } from '../core/Field';
import { Input, InputProps } from '../components/Input';
import { Select, SelectProps } from '../components/Select';
import { Stage, StageProps } from '../components/Stage';

type SideEffects<K> = {
  clear: K[];
  validate: K[];
};

type Validator<T> = (data: T) => Promise<string>;

type FormikroField<T, F extends keyof T, K> = {
  isRequired: boolean;
  validators?: Validator<T>[];
  disable?: (data: T) => boolean;
  initialValue?: T[F];
  stage?: K;
  sideEffects?: SideEffects<Exclude<keyof T, F>>;
};

export type FormikroOptions<T, K extends string> = {
  onSubmit: (fields: T) => Promise<unknown>;
  fields: {
    [field in keyof T]: FormikroField<T, field, K>;
  };
  stages?: K[];
};

export interface FormikroForm<T, K> extends React.FC<React.PropsWithChildren> {
  Input: React.FC<InputProps<T>>;
  Select: React.FC<SelectProps<T>>;
  Stage: React.FC<StageProps<K>>;
}

export function useFormikro<
  T extends Record<string, FieldValue>,
  K extends string = never
>(formId: string, options: FormikroOptions<T, K>) {
  const clientInstance = Global.initialize<T, K>(formId, options);

  const DynamicForm = useCallback<React.FC<React.PropsWithChildren>>(
    ({ children }) => {
      return (
        <form id={formId} onSubmit={(e) => e.preventDefault()}>
          {children}
        </form>
      );
    },
    [formId]
  );

  const ComposedForm = DynamicForm as FormikroForm<T, K>;

  ComposedForm.Input = useCallback(
    (props) => Input(clientInstance, props),
    [clientInstance]
  );
  ComposedForm.Stage = useCallback(
    (props) => Stage(clientInstance, props),
    [clientInstance]
  );
  ComposedForm.Select = useCallback(
    (props) => Select(clientInstance, props),
    [clientInstance]
  );

  return ComposedForm;
}
