import Form from '../core/Form';
import { StageState } from '../core/StateManager';
import { useStageState } from '../hooks';
import { useFormStages } from '../hooks';

export interface StageProps<T> {
  name: T;
  children: React.ReactNode;
}

export function Stage<T extends string>(Form: Form, props: StageProps<T>) {
  const { name, children } = props;
  const state = useStageState(Form, name);
  const stages = useFormStages(Form);

  return (
    <fieldset
      form={Form.id}
      name={name}
      style={{
        marginTop: 20,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: state === StageState.COMPLETE ? 'green' : 'red',
        backgroundColor: stages.active === name ? 'white' : '#EEE',
      }}
    >
      {children}
    </fieldset>
  );
}
