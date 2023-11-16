/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventBus, FormEvent } from './EventBus';
import { StateManager, FieldState } from './StateManager';

export type FieldValue = string | number | undefined;

export type FieldSideEffects = {
  clear: string[];
  validate: string[];
};

export type InitialFieldData = {
  isRequired: boolean;
  initialValue: FieldValue;
  validators?: Array<(fields: Record<string, FieldValue>) => Promise<string>>;
};

export type FieldData = {
  isRequired: boolean;
  currentState: FieldState;
  error: string;
  value: FieldValue;
  validators?: Array<(fields: Record<string, FieldValue>) => void>;
};

interface StageableField {
  getStageId(): string;
}

export interface FieldType {
  getValue(): FieldValue;
  getCurrentState(): FieldState;
  validate(): Promise<void>;
}

abstract class AbstractField implements FieldType {
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
  validate: () => Promise<void>;

  constructor(
    private id: string,
    private formId: string,
    data: InitialFieldData,
    private getFieldValues: () => Record<string, FieldValue>,
    private eventBus: EventBus
  ) {
    this.isRequired = data.isRequired;
    this.initialValue = data.initialValue;
    this.value = data.initialValue;
    this.validators = data.validators;
    this.currentState = data.isRequired
      ? data.initialValue
        ? FieldState.VALID
        : FieldState.INVALID
      : FieldState.VALID;

    this.handleUpdates = this.handleUpdates.bind(this);

    this.eventBus.subscribe(this.formId, this.id, this.handleUpdates);
    this.validate = this.debounce(this.asyncValidation, 360); // 360ms debounce
    this.validate = this.validate.bind(this);
  }

  private handleUpdates(event: FormEvent): void {
    const { type } = event;

    if (type === 'REQUEST_FIELD_DATA' && this.id === event.fieldId) {
      this.publishFieldData();
    }

    if (type === 'SET_FIELD_VALUE' && this.id === event.fieldId) {
      this.value = event.value;
      this.publishFieldData();
      this.validate();
    }
  }

  private goToState(state: FieldState, error?: string): void {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.currentState = state;
      this.error = error || '';
      this.publishFieldData();
    }
  }

  private publishFieldData() {
    this.eventBus.publish(this.formId, {
      type: 'FIELD_DATA_RESPONSE',
      fieldId: this.id,
      fieldData: {
        value: this.value,
        isRequired: this.isRequired,
        currentState: this.currentState,
        error: this.error,
      },
    });
  }

  getValue(): FieldValue {
    return this.value;
  }

  getCurrentState(): FieldState {
    return this.currentState;
  }

  private async asyncValidation(): Promise<void> {
    const fields = this.getFieldValues();
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
        await Promise.all(this.validators.map((fn) => fn(fields)));
        return this.goToState(FieldState.VALID);
      } catch (err) {
        return this.goToState(FieldState.INVALID, err as string);
      }
    }

    // If you're here, it's all good in the hood.
    return this.goToState(FieldState.VALID);
  }

  // Debounce function with types
  private debounce(
    func: (...args: unknown[]) => Promise<void>,
    delay: number
  ): (...args: unknown[]) => Promise<void> {
    let timer: NodeJS.Timeout;
    return (...args: unknown[]) => {
      clearTimeout(timer);
      return new Promise((resolve, reject) => {
        timer = setTimeout(async () => {
          try {
            const result = await func.apply(this, args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    };
  }
}

export class BasicField extends AbstractField {}

export class Field {
  constructor(private fieldType: FieldType & Partial<StageableField>) {
    this.validate = this.validate.bind(this);
  }

  get stageId() {
    if ('getStageId' in this.fieldType) {
      return this.fieldType.getStageId!();
    } else {
      return null;
    }
  }

  get value() {
    return this.fieldType.getValue();
  }

  get currentState(): FieldState {
    return this.fieldType.getCurrentState();
  }

  validate() {
    return this.fieldType.validate();
  }
}
