import { useCallback } from 'react';
// Cor3
import Global from '../core/Global';
import { FieldValue, DynamicFields } from '../core/types';
// Fi3lds
import { Input, InputProps } from '../components/Input';
import { Select, SelectProps } from '../components/Select';
import { Stage, StageProps } from '../components/Stage';
import { useFormState } from '.';

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
  Select: React.FC<SelectProps<T>>;
  Stage: React.FC<StageProps<K>>;
}

export function useFormikro<
  T extends Record<string, FieldValue>,
  K extends string = 'DEFAULT'
>(formId: string, options: FormOptions<T, K>) {
  const Form = Global.initialize<T>(
    formId,
    options.multiStage
      ? options.data
      : { DEFAULT: options.data as DynamicFields<T> }
  );

  const isSubmittable = useFormState(Form);

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
  ComposedForm.Select = useCallback((props) => Select(Form, props), [Form]);

  return { ComposedForm, isSubmittable };
}
