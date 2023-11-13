import { FormDispatch } from './Form';
import { StateManager, FieldState } from './StateManager';

export type FieldValue = string | number | undefined;

export type FieldSideEffects = {
  clear: string[];
  validate: string[];
};

export type InitialFieldData = {
  isRequired: boolean;
  initialValue: FieldValue;
};

export type FieldData = {
  isRequired: boolean;
  currentState: FieldState;
  error: string;
  value: FieldValue;
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
  getIsDisabled(): boolean;
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
  protected validators:
    | ((data: Record<string, FieldValue>) => Promise<string>)[]
    | undefined;
  protected error: string = '';
  protected disable:
    | boolean
    | ((data: Record<string, FieldValue>) => boolean)
    | undefined;
  protected sideEffects: FieldSideEffects | undefined;
  protected currentState: FieldState;
  protected stateManager = new StateManager('FIELD');

  constructor(
    fieldId: string,
    data: InitialFieldData,
    protected dispatchEvent: FormDispatch,
    protected validateForm: () => void,
    private getFieldsData: () => Record<string, FieldValue>
  ) {
    this.id = fieldId;
    this.uid = Math.random().toString(36).substring(2, 8);
    this.isRequired = data.isRequired;
    this.initialValue = data.initialValue;
    this.value = data.initialValue;
    this.currentState = data.isRequired
      ? data.initialValue
        ? FieldState.VALID
        : FieldState.INVALID
      : FieldState.VALID;

    this.validate = this.validate.bind(this);
  }

  protected goToState(state: FieldState, error?: string): void {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      // this.dispatchEvent({
      //   action: 'UPDATE_FIELD',
      //   fieldId: this.id,
      //   fieldData: {
      //     value: this.value,
      //     isRequired: this.isRequired,
      //     currentState: state,
      //     error: error || '',
      //   },
      // });
    }
    this.validateForm();
  }

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

  getIsDisabled(): boolean {
    if (this.disable !== undefined) {
      const data = this.getFieldsData();
      return typeof this.disable === 'function'
        ? this.disable(data)
        : this.disable;
    } else {
      return false;
    }
  }

  getValue(): FieldValue {
    return this.value;
  }

  setValue(value: FieldValue): void {
    this.value = value;
  }

  async validate() {
    const data = this.getFieldsData();
    const value = this.value;

    // Kicking off validation
    this.goToState(FieldState.VALIDATING);

    // First stop, required fields!
    if (!value && this.isRequired) {
      return this.goToState(FieldState.INVALID, 'This field is required');
    }

    // Array of validators? Cool, let's bring 'em on!
    if (this.validators && Array.isArray(this.validators)) {
      try {
        // Run 'em all and pass in all field values
        await Promise.all(this.validators.map((fn) => fn(data)));
        return this.goToState(FieldState.VALID);
      } catch (err) {
        return this.goToState(FieldState.INVALID, err as string);
      }
    }

    // If you're here, it's all good in the hood.
    return this.goToState(FieldState.VALID);
  }
}

export class BasicField extends AbstractField {}

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

  get isDisabled() {
    return this.fieldType.getIsDisabled();
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

  get data(): FieldData {
    return {
      value: this.value,
      isRequired: this.isRequired,
      currentState: this.currentState,
      error: this.error,
    };
  }

  update(value: FieldValue) {
    this.value = value;
  }
}
