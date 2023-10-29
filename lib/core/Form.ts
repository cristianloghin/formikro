import { ActionData, ActionKey, ActionPayload } from './Actions';
import { Client } from './Client';
import { Command } from './Command';
import { Worker } from './Worker';
import { EventBus, FormObserver } from './EventBus';
import { BasicField, Field, FieldData, StageField } from './Field';
import { Stage } from './Stage';
import { FieldState, FormState } from './__StateManager';
import { StateManager } from './StateManager';

export type FormDispatch = (
  action: ActionKey,
  payload: ActionPayload<ActionKey>,
  observerId?: string
) => void;

export interface Stageable {
  getStage(id: string): Stage | null;
}

export interface FormType {
  getField(id: string): Field | null;
  getFormId(): string;
  getFormState(): FormState;
  subscribe(action: ActionKey, observer: FormObserver, uid: string): void;
  unsubscribe(action: ActionKey, uid: string): void;
  dispatch: FormDispatch;
}

abstract class AbstractForm implements FormType {
  protected id: string;
  protected currentState: FormState;
  protected fields = new Map<string, Field>();
  protected eventBus = new EventBus();
  protected worker = new Worker();
  protected stateManager = new StateManager('FORM');

  constructor(id: string, fields: Record<string, unknown>) {
    this.id = id;
    this.currentState = FormState.NOT_SUBMITTABLE;
    this.dispatch = this.dispatch.bind(this);
    this.validate = this.validate.bind(this);

    Object.entries(fields).forEach(([name, value]) => {
      const fieldInstance = this.createField(name, value);
      this.fields.set(name, fieldInstance);
    });
  }

  dispatch(
    action: ActionKey,
    payload: ActionPayload<ActionKey>,
    observerId?: string
  ) {
    const command = new Command(this.worker, action, payload, this.copyData());

    const result = command.execute();
    this.fields = result.fields;
    this.currentState = result.currentState;

    this.eventBus.publish(action, observerId);
  }

  protected abstract createField(id: string, data: unknown): Field;

  copyData(): ActionData {
    return { currentState: this.currentState, fields: this.fields };
  }

  getField(id: string): Field | null {
    return this.fields.get(id) || null;
  }

  getFormId(): string {
    return this.id;
  }

  getFormState(): FormState {
    return this.currentState;
  }

  subscribe(action: ActionKey, observer: FormObserver, uid: string): void {
    this.eventBus.subscribe(action, observer, uid);
  }

  unsubscribe(action: ActionKey, uid: string): void {
    this.eventBus.unsubscribe(action, uid);
  }

  validate() {
    if (this.allFieldsValid()) {
      this.goToState(FormState.SUBMITTABLE);
    } else {
      this.goToState(FormState.NOT_SUBMITTABLE);
    }
  }

  private allFieldsValid() {
    const results: boolean[] = [];
    this.fields.forEach((field) => {
      results.push(field.currentState === FieldState.VALID);
    });

    return results.every((state) => state);
  }

  private goToState(state: FormState) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch('SET_FORM_STATE', { state });
    }
  }
}

export class BasicForm extends AbstractForm {
  protected createField(id: string, data: FieldData): Field {
    const fieldInstance = new Field(
      new BasicField(
        id,
        data.isRequired,
        data.initialValue,
        this.dispatch,
        this.validate
      )
    );
    return fieldInstance;
  }
  // Specific implementations
}

export class MultistageForm extends AbstractForm implements Stageable {
  private stages = new Map<string, Stage>();

  constructor(
    formId: string,
    fields: Record<string, unknown>,
    stages: string[]
  ) {
    super(formId, fields);

    this.stageFieldsValid = this.stageFieldsValid.bind(this);

    stages.forEach((stage, index) => {
      const StageInstance = new Stage(
        formId,
        stage,
        index === 0,
        this.stageFieldsValid
      );
      this.stages.set(stage, StageInstance);
    });
  }

  protected createField(id: string, data: FieldData): Field {
    const fieldInstance = new Field(
      new StageField(
        id,
        data.stage!,
        data.isRequired,
        data.initialValue,
        this.dispatch,
        this.validate
      )
    );

    return fieldInstance;
  }
  // Specific implementations

  getStage(id: string): Stage | null {
    return this.stages.get(id) || null;
  }

  stageFieldsValid(stageId: string): boolean {
    const results: boolean[] = [];
    this.fields.forEach((fieldInstance) => {
      if (fieldInstance.stageId === stageId) {
        results.push(fieldInstance.currentState === FieldState.VALID);
      }
    });

    return results.every((state) => state);
  }
}

export class Form {
  private client: Client;

  constructor(private type: FormType & Partial<Stageable>) {
    this.client = new Client(this.type);
  }

  getClient() {
    return this.client;
  }
}
