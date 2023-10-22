/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormObserver, FormState } from './types';
// import FormStateManager, { FormState } from './StateManager';
import StageObject from './StageObject';
import FieldObject from './FieldObject';
import FormCommand from './Command';
import FormWorker, { FORM_ACTIONS } from './Worker';
import FormEventBus from './EventBus';

class FormObject {
  private worker = new FormWorker();
  private eventBus = new FormEventBus();

  id: string;
  // currentState: FormState;
  // stateManager: FormStateManager;
  state: FormState = {
    stages: new Map<string, StageObject>(),
  };

  constructor(id: string, data: Record<string, Record<string, any>>) {
    this.id = id;

    Object.entries(data).forEach(([stage, fields]) => {
      this.state.stages.set(stage, new StageObject(stage, fields));
    });

    this.dispatch = this.dispatch.bind(this);

    // this.stateManager = new FormStateManager(stages);
    // this.stages = new Map(
    //   stages.map((stage) => [
    //     stage,
    //     new StageObject((isReady: boolean) => {
    //       if (this.isReady !== isReady) {
    //         this.isReady = isReady;
    //       }
    //     }, stage),
    //   ])
    // );
  }

  getField(fieldId: string): FieldObject {
    let Field;
    this.state.stages.forEach((stage) => {
      if (stage.fields.has(fieldId)) {
        Field = stage.fields.get(fieldId);
      }
    });
    return Field as unknown as FieldObject;
  }

  dispatch<ActionType extends keyof typeof FORM_ACTIONS>(
    action: ActionType,
    payload: Parameters<(typeof FORM_ACTIONS)[ActionType]>[0],
    actionPath?: string[]
  ) {
    const command = new FormCommand(this.worker, action, payload, this.state);

    // Mutate state using command
    this.state = command.execute();

    // Notify observers
    this.eventBus.publish(this.state, action, actionPath);
  }

  subscribe(action: string, observer: FormObserver, observerId: string) {
    this.eventBus.subscribe(action, observer, observerId);
  }

  unsubscribe(action: string, observerId: string) {
    this.eventBus.unsubscribe(action, observerId);
  }
}

export default FormObject;
