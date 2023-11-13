import { EventBus, FormEvent } from './EventBus';
import {
  BasicField,
  Field,
  InitialFieldData,
  FieldValue,
  FieldData,
} from './Field';
import { Stage } from './Stage';
import { FieldState, FormState, StateManager } from './StateManager';

export type FormDispatch = (event: FormEvent) => void;

export interface Stageable {
  getStage(id: string): Stage | null;
  currentStage: Stage;
  stages: Map<string, Stage>;
  goToStage(target: 'next' | 'previous'): void;
}

export type InitialFormOptions = {
  onSubmit: (fields: Record<string, FieldValue>) => Promise<unknown>;
  fields: Record<string, unknown>;
  stages?: string[];
};

export interface FormType {
  getFieldData(id: string): FieldData | undefined;
  getFields(): Record<string, FieldValue>;
  submitForm(): Promise<void>;
  getFormState(): FormState;
  handleUpdates(event: FormEvent): void;
}

abstract class AbstractForm implements FormType {
  protected currentState: FormState;
  protected fields = new Map<string, Field>();
  protected stateManager = new StateManager('FORM');
  protected onSubmit: (fields: Record<string, FieldValue>) => Promise<unknown>;

  constructor(
    protected formId: string,
    options: InitialFormOptions,
    protected eventBus: EventBus
  ) {
    this.currentState = FormState.NOT_SUBMITTABLE;
    this.handleUpdates = this.handleUpdates.bind(this);
    this.validate = this.validate.bind(this);
    this.getFieldData = this.getFieldData.bind(this);
    this.onSubmit = options.onSubmit;

    // Create fields
    Object.entries(options.fields).forEach(([fieldName, fieldData]) => {
      const fieldInstance = this.createField(fieldName, fieldData);
      this.fields.set(fieldName, fieldInstance);
    });

    this.eventBus.subscribe(this.formId, this.handleUpdates);
  }

  handleUpdates(event: FormEvent): void {
    switch (event.action) {
      case 'INITIALIZE_FIELD': {
        const { fieldId } = event;
        const field = this.fields.get(fieldId);
        if (field) {
          this.eventBus.publish(this.formId, {
            action: 'FIELD_INITIALIZED',
            fieldId,
            fieldData: field.data,
          });
        }
        break;
      }
      case 'UPDATE_FIELD': {
        const { fieldId, value } = event;
        const field = this.fields.get(fieldId);

        if (field) {
          // validate field -> update state
          field.update(value);

          this.eventBus.publish(this.formId, {
            action: 'FIELD_UPDATED',
            fieldId,
            fieldData: field.data,
          });

          // run side effects -> publish events
        }
        break;
      }
      case 'SUBMIT_FORM': {
        this.submitForm();
        break;
      }
    }
  }

  protected abstract createField(fieldName: string, fieldData: unknown): Field;
  abstract validate(): void;

  protected dispatchEvent(event: FormEvent): void {
    this.eventBus.publish(this.formId, event);
  }

  getFieldData(id: string): FieldData | undefined {
    const field = this.fields.get(id);
    if (field) {
      return field.data;
    }
    return undefined;
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

  getFieldsData(): Record<string, FieldValue> {
    const result: Record<string, FieldValue> = {};

    this.fields.forEach((field, key) => {
      result[key] = field.value;
    });

    return result;
  }

  getFormState(): FormState {
    return this.currentState;
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
      // this.dispatch('SET_FORM_STATE', { state });
    }
  }
}

export class BasicForm extends AbstractForm {
  protected createField(fieldName: string, fieldData: InitialFieldData): Field {
    const fieldInstance = new Field(
      new BasicField(
        fieldName,
        fieldData,
        this.dispatchEvent,
        this.validate,
        this.getFieldsData
      )
    );
    return fieldInstance;
  }

  validate() {
    if (this.allFieldsValid()) {
      this.goToState(FormState.SUBMITTABLE);
    } else {
      this.goToState(FormState.NOT_SUBMITTABLE);
    }
  }
}

export class Form {
  isProxy: boolean;
  type: FormType & Partial<Stageable>;

  constructor(type: FormType & Partial<Stageable>) {
    this.type = type;
    this.isProxy = false;
  }
}
