import FormWorker from './Worker';
import { ActionKey, ActionPayload } from './Actions';
import { FormData } from './types';

export interface Command {
  execute(): void;
}

class FormCommand implements Command {
  constructor(
    private worker: FormWorker,
    private action: ActionKey,
    private payload: ActionPayload<ActionKey>,
    private data: FormData
  ) {}

  execute() {
    const newForm = this.worker.mutateState(
      this.action,
      this.payload,
      this.data
    );

    // Use the worker to mutate the data and return it
    return newForm;
  }
}

export default FormCommand;
