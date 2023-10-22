import FormWorker, { FORM_ACTIONS } from './Worker';
import { FormState } from './types';

export interface Command {
  execute(): void;
}

class FormCommand implements Command {
  constructor(
    private worker: FormWorker,
    private action: keyof typeof FORM_ACTIONS,
    private payload: unknown,
    private state: FormState
  ) {}

  execute() {
    const newForm = this.worker.mutateState(
      this.action as keyof typeof FORM_ACTIONS,
      this.payload as Parameters<(typeof FORM_ACTIONS)[typeof this.action]>[0],
      this.state
    );

    // Use the worker to mutate the state and return it
    return newForm;
  }
}

export default FormCommand;
