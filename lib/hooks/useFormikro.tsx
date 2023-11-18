import { useCallback } from 'react';
import Global from '../core/Global';
import { Field as FieldInstance, FieldValue } from '../core/Field';
import { FieldProps } from '../components/Field';
import { Field } from '../components/Field';

type SubmitOptions<T> = {
  submitFn: (fields: T) => Promise<unknown>;
  onSuccess?: (response: unknown) => void;
  onError?: (error: unknown) => void;
};

type Validator<T, F extends keyof T> = (
  field: T[F],
  fields: { [key in Exclude<keyof T, F>]: FieldInstance<T[key]> }
) => Promise<string>;

type SideEffect<T, F extends keyof T> = (
  field: T[F],
  fields: { [key in Exclude<keyof T, F>]: FieldInstance<T[key]> }
) => void;

type FormikroField<T, F extends keyof T> = {
  isRequired: boolean;
  initialValue?: T[F];
  validators?: Validator<T, F>[];
  sideEffects?: SideEffect<T, F>[];
};

export type FormikroOptions<T> = {
  submit: SubmitOptions<T>;
  fields: {
    [field in keyof T]: FormikroField<T, field>;
  };
};

export interface FormikroForm<T> extends React.FC<React.PropsWithChildren> {
  Field: React.FC<FieldProps<T>>;
}

export function useFormikro<T extends Record<string, FieldValue>>(
  formId: string,
  options: FormikroOptions<T>
) {
  Global.initialize<T>(formId, options);

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

  const ComposedForm = DynamicForm as FormikroForm<T>;

  ComposedForm.Field = useCallback((props) => Field(formId, props), [formId]);

  return ComposedForm;
}
