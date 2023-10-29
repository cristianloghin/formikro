import { Client } from '../core/Client';
import { useStage } from '../hooks';

export interface StageProps<T> {
  name: T;
  children: React.ReactNode;
}

export function Stage<T extends string>(
  clientInstance: Client,
  props: StageProps<T>
) {
  const { name, children } = props;
  const { isComplete, isActive, formId } = useStage(clientInstance, name);

  return (
    <fieldset
      form={formId}
      name={name}
      style={{
        marginTop: 20,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: isComplete ? 'green' : 'red',
        backgroundColor: isActive ? 'white' : '#EEE',
      }}
    >
      {children}
    </fieldset>
  );
}
