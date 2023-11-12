import Global from '../core/Global';
import { useStage } from '../hooks';

export interface StageProps<T> {
  name: T;
  children: React.ReactNode;
}

export function Stage<T extends string>(formId: string, props: StageProps<T>) {
  const { name, children } = props;
  const client = Global.getClient(formId);
  const { isComplete, isActive } = useStage(client, name);

  return (
    isActive && (
      <fieldset
        form={client.formId}
        name={name}
        style={{
          marginTop: 20,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: isComplete ? 'green' : 'red',
        }}
      >
        {children}
      </fieldset>
    )
  );
}
