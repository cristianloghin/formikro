/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormObserver } from './types';
// import FormStateManager, { FormState } from './StateManager';
// import FormWorker from './Worker';
// import FormEventBus from './EventBus';
import StageObject from './StageObject';
import FieldObject from './FieldObject';

class FormObject {
  // private worker = new FormWorker();
  // private eventBus = new FormEventBus();

  id: string;
  // currentState: FormState;
  // stateManager: FormStateManager;
  stages = new Map<string, StageObject>();

  constructor(id: string, data: Record<string, Record<string, any>>) {
    this.id = id;

    Object.entries(data).forEach(([stage, fields]) => {
      this.stages.set(stage, new StageObject(stage, fields));
    });

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
    this.stages.forEach((stage) => {
      if (stage.fields.has(fieldId)) {
        Field = stage.fields.get(fieldId);
      }
    });
    return Field as unknown as FieldObject;
  }

  dispatch(action: any, payload: any) {
    console.log('Dispatch', action, payload);
  }

  subscribe(action: string, observer: FormObserver, observerId: string) {
    console.log('Subscribe', action, observerId);
  }

  unsubscribe(observerId: string) {
    console.log('Unsubscribe observer', observerId);
  }
}

export default FormObject;
