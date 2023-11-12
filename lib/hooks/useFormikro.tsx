import { useCallback } from 'react';
import Global from '../core/Global';
import { FieldValue } from '../core/Field';
import { Stage, StageProps } from '../components/Stage';
import { FieldProps } from '../components/Field';
import { Field } from '../components/Field';

type SideEffects<K> = {
  clear?: K[];
  validate?: K[];
};

type Validator<T> = (data: T) => Promise<string>;

type FormikroField<T, F extends keyof T, K> = {
  isRequired: boolean;
  validators?: Validator<T>[];
  disable?: boolean | ((data: T) => boolean);
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
  Field: React.FC<FieldProps<T>>;
  Stage: React.FC<StageProps<K>>;
}

export function useFormikro<
  T extends Record<string, FieldValue>,
  K extends string = never
>(formId: string, options: FormikroOptions<T, K>) {
  Global.initialize<T, K>(formId, options);

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

  ComposedForm.Field = useCallback((props) => Field(formId, props), [formId]);
  ComposedForm.Stage = useCallback((props) => Stage(formId, props), [formId]);

  return ComposedForm;
}
