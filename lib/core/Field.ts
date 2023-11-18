/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventBus, FormEvent } from './EventBus';
import { StateManager, FieldState } from './StateManager';

type DefaultFieldValue = string | number | undefined;
export type FieldValue<T = DefaultFieldValue> = T extends undefined
  ? DefaultFieldValue
  : T | undefined;

type FieldValidators = Array<
  (field: FieldValue, fields: Record<string, Field>) => Promise<string>
>;

type FieldSideEffects = Array<
  (field: FieldValue, fields: Record<string, Field>) => void
>;

export type InitialFieldData = {
  isRequired: boolean;
  initialValue: FieldValue;
  validators?: FieldValidators;
  sideEffects?: FieldSideEffects;
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
  id: string;
  formId: string;
  eventBus: EventBus;
  getValue(): FieldValue;
  getCurrentState(): FieldState;
}

abstract class AbstractField implements FieldType {
  protected isRequired: boolean;
  protected initialValue: FieldValue;
  protected value: FieldValue;
  protected validators: FieldValidators | undefined;
  protected sideEffects: FieldSideEffects | undefined;
  protected error: string = '';
  protected currentState: FieldState;
  protected stateManager = new StateManager('FIELD');

  id: string;
  formId: string;
  eventBus: EventBus;
  validate: () => Promise<void>;

  constructor(
    id: string,
    formId: string,
    data: InitialFieldData,
    private getFields: (options?: {
      exclude?: string[];
    }) => Record<string, Field>,
    eventBus: EventBus
  ) {
    this.isRequired = data.isRequired;
    this.initialValue = data.initialValue;
    this.value = data.initialValue;
    this.validators = data.validators;
    this.sideEffects = data.sideEffects;
    this.currentState = data.isRequired
      ? data.initialValue
        ? FieldState.VALID
        : FieldState.INVALID
      : FieldState.VALID;

    this.handleUpdates = this.handleUpdates.bind(this);

    this.id = id;
    this.formId = formId;
    this.eventBus = eventBus;
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
      this.validate().then(() => {
        this.effects();
        this.eventBus.publish(this.formId, { type: 'VALIDATE_FORM' });
      });
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

  private effects(): void {
    const fields = this.getFields({ exclude: [this.id] });
    const value = this.value;
    this.sideEffects?.map((fn) => fn(value, fields));
  }

  private async asyncValidation(): Promise<void> {
    const fields = this.getFields({ exclude: [this.id] });
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
        await Promise.all(this.validators.map((fn) => fn(value, fields)));
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

export class Field<T = DefaultFieldValue> {
  private eventBus: EventBus;

  constructor(private fieldType: FieldType & Partial<StageableField>) {
    this.eventBus = this.fieldType.eventBus;
  }

  get stageId() {
    if ('getStageId' in this.fieldType) {
      return this.fieldType.getStageId!();
    } else {
      return null;
    }
  }

  get value() {
    return this.fieldType.getValue() as FieldValue<T>;
  }

  set value(value: FieldValue<T>) {
    this.eventBus.publish(this.fieldType.formId, {
      type: 'SET_FIELD_VALUE',
      fieldId: this.fieldType.id,
      value: value as FieldValue,
    });
  }

  get currentState(): FieldState {
    return this.fieldType.getCurrentState();
  }
}
