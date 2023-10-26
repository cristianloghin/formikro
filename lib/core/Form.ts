/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormObserver, FormData } from './types';
import Stage from './Stage';
import Field from './Field';
import FormCommand from './Command';
import FormWorker from './Worker';
import { ActionPayload, ActionKey } from './Actions';
import FormEventBus from './EventBus';
import FormStateManager, { FormState, StageState } from './StateManager';
import Client from './Client';

class Form {
  private worker = new FormWorker();
  private eventBus = new FormEventBus();

  id: string;
  private client: Client;
  stateManager: FormStateManager;
  stageStateManager: FormStateManager;
  fieldStateManager: FormStateManager;

  data: FormData = {
    currentState: FormState.NOT_SUBMITTABLE,
    currentStage: ['DEFAULT', StageState.INCOMPLETE],
    stages: new Map<string, Stage>(),
  };

  constructor(id: string, data: Record<string, Record<string, any>>) {
    this.id = id;

    this.dispatch = this.dispatch.bind(this);
    this.getActiveStage = this.getActiveStage.bind(this);

    this.stateManager = new FormStateManager('FORM');
    this.fieldStateManager = new FormStateManager('FIELD');
    this.stageStateManager = new FormStateManager('STAGE');
    this.validate = this.validate.bind(this);

    Object.entries(data).forEach(([stage, fields], index) => {
      const StageInstance = new Stage(
        stage,
        fields,
        this.stageStateManager,
        this.fieldStateManager,
        this.dispatch,
        this.validate
      );

      if (index === 0) {
        this.data.currentStage = [StageInstance.id, StageInstance.currentState];
      }

      this.data.stages.set(stage, StageInstance);
    });

    this.client = new Client(
      { formId: this.id },
      Array.from(this.data.stages.keys()),
      this.getActiveStage,
      this.dispatch
    );
  }

  getField(fieldId: string): Field {
    let FieldInstance;
    this.data.stages.forEach((stage) => {
      if (stage.fields.has(fieldId)) {
        FieldInstance = stage.fields.get(fieldId);
      }
    });
    return FieldInstance as unknown as Field;
  }

  getStage(stageId: string): Stage {
    const StageInstance = this.data.stages.get(stageId);

    return StageInstance as unknown as Stage;
  }

  getClient(): Client {
    return this.client;
  }

  private getActiveStage(): [string, StageState] {
    return this.data.currentStage;
  }

  validate() {
    if (this.allStagesValid()) {
      this.goToState(FormState.SUBMITTABLE);
    } else {
      this.goToState(FormState.NOT_SUBMITTABLE);
    }
  }

  private allStagesValid(): boolean {
    const results: boolean[] = [];
    this.data.stages.forEach((Stage) => {
      results.push(Stage.currentState === StageState.COMPLETE);
    });

    return results.every((state) => state);
  }

  private goToState(state: FormState) {
    if (this.stateManager.canTransitionTo(this.data.currentState, state)) {
      this.dispatch('SET_FORM_STATE', {
        value: state,
        path: undefined,
      });
    }
  }

  dispatch(action: ActionKey, payload: ActionPayload<ActionKey>) {
    const command = new FormCommand(this.worker, action, payload, this.data);

    // Mutate data using command
    this.data = command.execute();

    // Notify observers
    this.eventBus.publish(this.data, action, payload.path);
  }

  subscribe(action: string, observer: FormObserver, observerId: string) {
    this.eventBus.subscribe(action, observer, observerId);
  }

  unsubscribe(action: string, observerId: string) {
    this.eventBus.unsubscribe(action, observerId);
  }
}

export default Form;
