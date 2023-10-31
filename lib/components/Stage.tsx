import { Client } from '../core/Client';
import { useStage } from '../hooks';

export interface StageProps<T> {
  name: T;
  children: React.ReactNode;
}

export function Stage<T extends string>(client: Client, props: StageProps<T>) {
  const { name, children } = props;
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
