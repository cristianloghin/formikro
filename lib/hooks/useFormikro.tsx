import { useCallback } from 'react';
import Global from '../core/Global';
import { FieldValue } from '../core/Field';
import { FieldProps } from '../components/Field';
import { Field } from '../components/Field';

type Validator<T> = (data: T) => Promise<string>;

type FormikroField<T, F extends keyof T> = {
  isRequired: boolean;
  initialValue?: T[F];
  validators?: Validator<T>[];
};

export type FormikroOptions<T> = {
  onSubmit: (fields: T) => Promise<unknown>;
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
