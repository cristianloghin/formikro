/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormObserver, FormState } from './types';
import Stage from './Stage';
import Field from './Field';
import FormCommand from './Command';
import FormWorker from './Worker';
import { ActionPayload, ActionKey } from './Actions';
import FormEventBus from './EventBus';
import FormStateManager, {
  FormState as FormStateType,
  StageState,
} from './StateManager';

class Form {
  private worker = new FormWorker();
  private eventBus = new FormEventBus();

  id: string;
  stateManager: FormStateManager;
  stageStateManager: FormStateManager;
  fieldStateManager: FormStateManager;
  state: FormState = {
    currentState: FormStateType.NOT_SUBMITTABLE,
    stages: new Map<string, Stage>(),
  };

  constructor(id: string, data: Record<string, Record<string, any>>) {
    this.id = id;

    this.dispatch = this.dispatch.bind(this);

    this.stateManager = new FormStateManager('FORM');
    this.fieldStateManager = new FormStateManager('FIELD');
    this.stageStateManager = new FormStateManager('STAGE');
    this.validate = this.validate.bind(this);

    Object.entries(data).forEach(([stage, fields]) => {
      this.state.stages.set(
        stage,
        new Stage(
          stage,
          fields,
          this.stageStateManager,
          this.fieldStateManager,
          this.dispatch,
          this.validate
        )
      );
    });
  }

  getField(fieldId: string): Field {
    let Field;
    this.state.stages.forEach((stage) => {
      if (stage.fields.has(fieldId)) {
        Field = stage.fields.get(fieldId);
      }
    });
    return Field as unknown as Field;
  }

  getStage(stageId: string): Stage {
    const Stage = this.state.stages.get(stageId);

    return Stage as unknown as Stage;
  }

  validate() {
    if (this.allStagesValid()) {
      this.goToState(FormStateType.SUBMITTABLE);
    } else {
      this.goToState(FormStateType.NOT_SUBMITTABLE);
    }
  }

  private allStagesValid(): boolean {
    const results: boolean[] = [];
    this.state.stages.forEach((Stage) => {
      results.push(Stage.currentState === StageState.COMPLETE);
    });

    return results.every((state) => state);
  }

  private goToState(state: FormStateType) {
    if (this.stateManager.canTransitionTo(this.state.currentState, state)) {
      this.dispatch('SET_FORM_STATE', {
        value: state,
        path: undefined,
      });
    }
  }

  dispatch(action: ActionKey, payload: ActionPayload<ActionKey>) {
    const command = new FormCommand(this.worker, action, payload, this.state);

    // Mutate state using command
    this.state = command.execute();

    // Notify observers
    this.eventBus.publish(this.state, action, payload.path);
  }

  subscribe(action: string, observer: FormObserver, observerId: string) {
    this.eventBus.subscribe(action, observer, observerId);
  }

  unsubscribe(action: string, observerId: string) {
    this.eventBus.unsubscribe(action, observerId);
  }
}

export default Form;
