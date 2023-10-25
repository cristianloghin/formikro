import Form from '../core/Form';
import { StageState } from '../core/StateManager';
import { useStageState } from '../hooks';

export interface StageProps<T> {
  name: T;
  children: React.ReactNode;
}

export function Stage<T extends string>(Form: Form, props: StageProps<T>) {
  const { name, children } = props;
  const state = useStageState(Form, name);

  return (
    <fieldset
      form={Form.id}
      name={name}
      style={{
        marginTop: 20,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: state === StageState.COMPLETE ? 'green' : 'red',
      }}
    >
      {children}
    </fieldset>
  );
}
