import FormInstance from '../core/FormObject';

export interface StageProps<T> {
  name: T;
  children: React.ReactNode;
}

export function Stage<T extends string>(
  Form: FormInstance | undefined,
  props: StageProps<T>
) {
  const { name, children } = props;
  if (!Form) return null;

  return (
    <fieldset form={Form.id} name={name} style={{ marginTop: 20 }}>
      {children}
    </fieldset>
  );
}
