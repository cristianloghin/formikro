import FormWorker from './Worker';
import { ActionKey, ActionPayload } from './Actions';
import { FormState } from './types';

export interface Command {
  execute(): void;
}

class FormCommand implements Command {
  constructor(
    private worker: FormWorker,
    private action: ActionKey,
    private payload: ActionPayload<ActionKey>,
    private state: FormState
  ) {}

  execute() {
    const newForm = this.worker.mutateState(
      this.action,
      this.payload,
      this.state
    );

    // Use the worker to mutate the state and return it
    return newForm;
  }
}

export default FormCommand;
