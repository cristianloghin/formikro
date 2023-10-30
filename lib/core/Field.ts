import { FormDispatch } from './Form';
import { StateManager, FieldState } from './StateManager';

export type FieldValue = string | number | undefined;

export type FieldSideEffects = {
  clear: string[];
  validate: string[];
};

export type FieldData = {
  isRequired: boolean;
  initialValue: FieldValue | undefined;
  validator?: (value: FieldValue) => Promise<string>;
  sideEffects?: FieldSideEffects;
  stage: string | undefined;
};

interface StageableField {
  getStageId(): string;
}

export interface FieldType {
  getId(): string;
  getUid(): string;
  getCurrentState(): FieldState;
  setCurrentState(state: FieldState): void;
  getError(): string;
  setError(err: string): void;
  getIsRequired(): boolean;
  getSideEffects(): FieldSideEffects | undefined;
  getValue(): FieldValue;
  setValue(value: FieldValue): void;
  validate(): void;
}

abstract class AbstractField implements FieldType {
  protected id: string;
  protected uid: string;
  protected isRequired: boolean;
  protected initialValue: FieldValue;
  protected value: FieldValue;
  protected validator: ((value: FieldValue) => Promise<string>) | undefined;
  protected error: string = '';
  protected sideEffects: FieldSideEffects | undefined;
  protected currentState: FieldState;
  protected stateManager = new StateManager('FIELD');

  constructor(
    fieldId: string,
    data: FieldData,
    protected dispatch: FormDispatch,
    protected validateForm: () => void
  ) {
    this.id = fieldId;
    this.uid = Math.random().toString(36).substring(2, 8);
    this.isRequired = data.isRequired;
    this.initialValue = data.initialValue;
    this.value = data.initialValue;
    this.validator = data.validator;
    this.sideEffects = data.sideEffects;
    this.currentState = data.isRequired
      ? data.initialValue
        ? FieldState.VALID
        : FieldState.INVALID
      : FieldState.VALID;

    this.validate = this.validate.bind(this);
  }

  protected abstract goToState(state: FieldState, error?: string): void;

  getId(): string {
    return this.id;
  }

  getUid(): string {
    return this.uid;
  }

  getSideEffects(): FieldSideEffects | undefined {
    return this.sideEffects;
  }

  getCurrentState(): FieldState {
    return this.currentState;
  }

  setCurrentState(state: FieldState) {
    this.currentState = state;
  }

  getError(): string {
    return this.error;
  }

  setError(err: string) {
    this.error = err;
  }

  getIsRequired(): boolean {
    return this.isRequired;
  }

  getValue(): FieldValue {
    return this.value;
  }

  setValue(value: FieldValue): void {
    this.value = value;
  }

  validate() {
    const value = this.value;

    this.goToState(FieldState.VALIDATING);
    if (!value && this.isRequired) {
      this.goToState(FieldState.INVALID, 'This field is required');
    } else {
      if (this.validator) {
        this.validator(value)
          .then(() => {
            this.goToState(FieldState.VALID);
          })
          .catch((err) => {
            console.log(err);
            this.goToState(FieldState.INVALID, err);
          });
      } else {
        this.goToState(FieldState.VALID);
      }
    }
  }
}

export class BasicField extends AbstractField {
  protected goToState(state: FieldState, error: string | undefined) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch(
        'SET_FIELD_STATE',
        {
          id: this.id,
          state,
          error: error || '',
        },
        this.uid
      );
    }
    this.validateForm();
  }
}

export class StageField extends AbstractField implements StageableField {
  private stageId: string;

  constructor(
    fieldId: string,
    data: FieldData,
    dispatch: FormDispatch,
    validateForm: () => void
  ) {
    super(fieldId, data, dispatch, validateForm);
    this.stageId = data.stage!;
  }

  // Specific implementations

  getStageId(): string {
    return this.stageId;
  }

  protected goToState(state: FieldState, error: string | undefined) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch(
        'SET_FIELD_STATE',
        {
          id: this.id,
          state,
          error: error || '',
        },
        this.uid
      );
    }
    this.validateForm();
  }
}

export class Field {
  constructor(private fieldType: FieldType & Partial<StageableField>) {
    this.validate = this.validate.bind(this);
  }

  get id() {
    return this.fieldType.getId();
  }

  get uid() {
    return this.fieldType.getUid();
  }

  get stageId() {
    if ('getStageId' in this.fieldType) {
      return this.fieldType.getStageId!();
    } else {
      return null;
    }
  }

  get isRequired() {
    return this.fieldType.getIsRequired();
  }

  get sideEffects() {
    return this.fieldType.getSideEffects();
  }

  get currentState() {
    return this.fieldType.getCurrentState();
  }

  set currentState(state: FieldState) {
    this.fieldType.setCurrentState(state);
  }

  get error() {
    return this.fieldType.getError();
  }

  set error(err: string) {
    this.fieldType.setError(err);
  }

  get value() {
    return this.fieldType.getValue();
  }

  set value(value: FieldValue) {
    this.fieldType.setValue(value);
  }

  validate() {
    return this.fieldType.validate();
  }
}
