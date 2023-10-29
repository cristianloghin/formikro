import { FormDispatch } from './Form';
import { StateManager, FieldState } from './StateManager';

export type FieldValue = string | number | undefined;

export type FieldData = {
  isRequired: boolean;
  initialValue: FieldValue | undefined;
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
  getIsRequired(): boolean;
  getValue(): FieldValue;
  setValue(value: FieldValue): void;
  validate(value: FieldValue): void;
}

abstract class AbstractField implements FieldType {
  protected id: string;
  protected uid: string;
  protected isRequired: boolean;
  protected initialValue: FieldValue;
  protected value: FieldValue;
  protected currentState: FieldState;
  protected stateManager = new StateManager('FIELD');

  constructor(
    fieldId: string,
    isRequired: boolean,
    initialValue: FieldValue,
    protected dispatch: FormDispatch,
    protected validateForm: () => void
  ) {
    this.id = fieldId;
    this.uid = Math.random().toString(36).substring(2, 8);
    this.isRequired = isRequired;
    this.initialValue = initialValue;
    this.currentState = initialValue ? FieldState.VALID : FieldState.INVALID;

    this.validate = this.validate.bind(this);
  }

  protected abstract goToState(state: FieldState): void;

  getId(): string {
    return this.id;
  }

  getUid(): string {
    return this.uid;
  }

  getCurrentState(): FieldState {
    return this.currentState;
  }

  setCurrentState(state: FieldState) {
    this.currentState = state;
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

  validate(value: FieldValue) {
    this.goToState(FieldState.VALIDATING);
    if (!value && this.isRequired) {
      this.goToState(FieldState.INVALID);
    } else {
      this.goToState(FieldState.VALID);
    }
  }
}

export class BasicField extends AbstractField {
  protected goToState(state: FieldState) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch(
        'SET_FIELD_STATE',
        {
          id: this.id,
          state,
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
    stageId: string,
    isRequired: boolean,
    initialValue: FieldValue,
    dispatch: FormDispatch,
    validateForm: () => void
  ) {
    super(fieldId, isRequired, initialValue, dispatch, validateForm);
    this.stageId = stageId;
  }

  // Specific implementations

  getStageId(): string {
    return this.stageId;
  }

  protected goToState(state: FieldState) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch(
        'SET_FIELD_STATE',
        {
          id: this.id,
          state,
        },
        this.uid
      );
    }
    // this.validateStage();
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

  get currentState() {
    return this.fieldType.getCurrentState();
  }

  set currentState(state: FieldState) {
    this.fieldType.setCurrentState(state);
  }

  get value() {
    return this.fieldType.getValue();
  }

  set value(value: FieldValue) {
    this.fieldType.setValue(value);
  }

  validate(value: FieldValue) {
    return this.fieldType.validate(value);
  }
}
