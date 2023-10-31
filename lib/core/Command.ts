import { Worker } from './Worker';
import { ActionData, ActionKey, ActionPayload } from './Actions';

export class Command {
  constructor(
    private worker: Worker,
    private action: ActionKey,
    private payload: ActionPayload<ActionKey>,
    private data: ActionData
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
