import { ActionData, ActionKey, ActionPayload } from './Actions';
import { Client } from './Client';
import { Command } from './Command';
import { Worker } from './Worker';
import { EventBus, FormEvent, FormObserver } from './EventBus';
import { BasicField, Field, FieldData, FieldValue, StageField } from './Field';
import { Stage } from './Stage';
import { FieldState, FormState, StateManager } from './StateManager';
import { StageManager } from './StageManager';

export type FormDispatch = (
  action: ActionKey,
  payload: ActionPayload<ActionKey>,
  observerId?: string
) => void;

export interface Stageable {
  getStage(id: string): Stage | null;
  currentStage: Stage;
  stages: Map<string, Stage>;
  goToStage(target: 'next' | 'previous'): void;
}

export interface FormType {
  getField(id: string): Field | null;
  getFields(): Record<string, FieldValue>;
  getFormId(): string;
  submitForm(): Promise<void>;
  getFormState(): FormState;
  subscribe(action: ActionKey, observer: FormObserver, uid: string): void;
  unsubscribe(action: ActionKey, uid: string): void;
  dispatch: FormDispatch;
  handleUpdates(event: FormEvent): void;
}

abstract class AbstractForm implements FormType {
  protected currentState: FormState;
  protected fields = new Map<string, Field>();
  protected eventBus = new EventBus();
  protected worker = new Worker();
  protected stateManager = new StateManager('FORM');

  constructor(
    id: string,
    protected onSubmit: (
      fields: Record<string, FieldValue>
    ) => Promise<unknown>,
    fields: Record<string, unknown>
  ) {
    this.currentState = FormState.NOT_SUBMITTABLE;
    this.dispatch = this.dispatch.bind(this);
    this.validate = this.validate.bind(this);
    this.getFieldData = this.getFieldData.bind(this);

    Object.entries(fields).forEach(([name, value]) => {
      const fieldInstance = this.createField(name, value);
      this.fields.set(name, fieldInstance);
    });
  }

  abstract handleUpdates(event: FormEvent): void;

  abstract dispatch(
    action: ActionKey,
    payload: ActionPayload<ActionKey>,
    observerId?: string
  ): void;
  protected abstract createField(id: string, data: unknown): Field;
  abstract validate(): void;
  abstract copyData(): ActionData;

  getField(id: string): Field | null {
    return this.fields.get(id) || null;
  }

  getFields(): Record<string, FieldValue> {
    const fields: Record<string, FieldValue> = {};

    this.fields.forEach((field, key) => {
      fields[key] = field.value;
    });

    return fields;
  }

  async submitForm(): Promise<void> {
    const fields = this.getFields();
    this.goToState(FormState.SUBMITTING);

    return this.onSubmit(fields)
      .then(() => {
        this.goToState(FormState.SUCCESS);
        return;
      })
      .catch((error) => {
        this.goToState(FormState.ERROR);
        throw error;
      });
  }

  getFieldData(): Record<string, FieldValue> {
    const result: Record<string, FieldValue> = {};

    this.fields.forEach((field, key) => {
      result[key] = field.value;
    });

    return result;
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

  protected allFieldsValid() {
    const results: boolean[] = [];
    this.fields.forEach((field) => {
      results.push(field.currentState === FieldState.VALID);
    });

    return results.every((state) => state);
  }

  protected goToState(state: FormState) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch('SET_FORM_STATE', { state });
    }
  }
}

export class BasicForm extends AbstractForm {
  protected createField(id: string, data: FieldData): Field {
    const fieldInstance = new Field(
      new BasicField(id, data, this.dispatch, this.validate, this.getFieldData)
    );
    return fieldInstance;
  }

  // Specific implementations
  handleUpdates(event: FormEvent): void {
    console.log(event);
  }

  copyData(): ActionData {
    return { currentState: this.currentState, fields: this.fields };
  }

  validate() {
    if (this.allFieldsValid()) {
      this.goToState(FormState.SUBMITTABLE);
    } else {
      this.goToState(FormState.NOT_SUBMITTABLE);
    }
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
}

export class MultistageForm extends AbstractForm implements Stageable {
  stages = new Map<string, Stage>();
  private stageManager: StageManager;

  constructor(
    formId: string,
    onSubmit: (fields: Record<string, FieldValue>) => Promise<unknown>,
    fields: Record<string, unknown>,
    stages: string[]
  ) {
    super(formId, onSubmit, fields);

    this.stageFieldsValid = this.stageFieldsValid.bind(this);
    this.validateStages = this.validateStages.bind(this);
    this.stageManager = new StageManager(stages, this.dispatch);

    stages.forEach((stage, index) => {
      const StageInstance = new Stage(
        formId,
        stage,
        index,
        this.stageFieldsValid,
        this.dispatch
      );
      this.stages.set(stage, StageInstance);
    });
  }

  protected createField(id: string, data: FieldData): Field {
    const fieldInstance = new Field(
      new StageField(id, data, this.dispatch, this.validate, this.getFieldData)
    );

    return fieldInstance;
  }
  // Specific implementations
  handleUpdates(event: FormEvent): void {
    console.log(event);
  }

  copyData(): ActionData {
    return {
      currentState: this.currentState,
      fields: this.fields,
      stages: this.stages,
    };
  }

  getStage(id: string): Stage | null {
    return this.stages.get(id) || null;
  }

  get currentStage(): Stage {
    let current: Stage | null = null;
    this.stages.forEach((stage) => {
      if (stage.isActive) {
        current = stage;
      }
    });

    return current!;
  }

  goToStage(target: 'next' | 'previous'): void {
    const current = this.currentStage;
    switch (target) {
      case 'previous':
        this.stageManager.goToPreviousStage(current.id);
        break;
      case 'next':
        this.stageManager.goToNextStage(current.id);
        break;
    }
  }

  validate() {
    if (this.allFieldsValid()) {
      this.goToState(FormState.SUBMITTABLE);
    } else {
      this.goToState(FormState.NOT_SUBMITTABLE);
    }

    this.validateStages();
  }

  validateStages() {
    this.stages.forEach((stage) => {
      stage.validate();
    });
  }

  private stageFieldsValid(stageId: string): boolean {
    const results: boolean[] = [];
    this.fields.forEach((field) => {
      if (field.stageId === stageId) {
        results.push(field.currentState === FieldState.VALID);
      }
    });

    return results.every((state) => state);
  }

  dispatch(
    action: ActionKey,
    payload: ActionPayload<ActionKey>,
    observerId?: string | undefined
  ): void {
    const command = new Command(this.worker, action, payload, this.copyData());

    const result = command.execute();

    this.fields = result.fields;
    this.currentState = result.currentState;
    this.stages = result.stages!;

    this.eventBus.publish(action, observerId);
  }
}

export class Form {
  constructor(
    private formId: string,
    private type: FormType & Partial<Stageable>,
    private eventBus: EventBus
  ) {
    this.eventBus.subscribe(this.formId, this.type.handleUpdates);
  }
}
