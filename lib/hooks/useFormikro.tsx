import { useCallback } from 'react';
// Cor3
import { FieldValue, DynamicFields } from '../core/types';
import FormState from '../core/State';
// Fi3lds
import { Input, InputProps } from '../fields/Input';
import { Stage, StageProps } from '../fields/Stage';

export type FormOptions<T, K extends string> = K extends 'DEFAULT'
  ? {
      onSubmit: (data: T) => Promise<unknown>;
      data: DynamicFields<T>;
    }
  : {
      onSubmit: (data: T) => Promise<unknown>;
      multiStage: true;
      data: Record<K, DynamicFields<T>>;
    };

export interface FormikroForm<T, K> extends React.FC<React.PropsWithChildren> {
  Input: React.FC<InputProps<T>>;
  Stage: React.FC<StageProps<K>>;
}

export function useFormikro<
  T extends Record<string, FieldValue>,
  K extends string = 'DEFAULT'
>(formId: string, options: FormOptions<T, K>) {
  const Form = FormState.initialize<T>(
    formId,
    options.multiStage
      ? options.data
      : { DEFAULT: options.data as DynamicFields<T> }
  );

  const DynamicForm = useCallback<React.FC<React.PropsWithChildren>>(
    ({ children }) => {
      return (
        <form id={formId} onSubmit={(e) => e.preventDefault()}>
          {options.multiStage
            ? children
            : Stage(Form, { name: 'DEFAULT', children })}
        </form>
      );
    },
    [Form, formId, options.multiStage]
  );

  const ComposedForm = DynamicForm as FormikroForm<T, K>;

  ComposedForm.Input = useCallback((props) => Input(Form, props), [Form]);
  ComposedForm.Stage = useCallback((props) => Stage(Form, props), [Form]);

  return ComposedForm;
}
