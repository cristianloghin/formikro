import FormWorker from './Worker';
import formActions from './actions';
import { FormState } from './types';

export interface Command {
  execute(): void;
}

class FormCommand implements Command {
  constructor(
    private worker: FormWorker,
    private action: keyof typeof formActions,
    private payload: unknown,
    private state: FormState
  ) {}

  execute() {
    const newForm = this.worker.mutateState(
      this.action as keyof typeof formActions,
      this.payload as Parameters<(typeof formActions)[typeof this.action]>[0],
      this.state
    );

    // Use the worker to mutate the state and return it
    return newForm;
  }
}

export default FormCommand;
