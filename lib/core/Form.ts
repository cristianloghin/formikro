import { EventBus, FormEvent } from './EventBus';
import { BasicField, Field, InitialFieldData, FieldValue } from './Field';
import { Stage } from './Stage';
import { FieldState, FormState, StateManager } from './StateManager';

export type FormData = {
  currentState: FormState;
  fields: Record<string, FieldValue>;
};

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
  submitForm(): Promise<void>;
  getFormState(): FormState;
  handleUpdates(event: FormEvent): void;
}

abstract class AbstractForm implements FormType {
  protected currentState: FormState;
  protected stateManager = new StateManager('FORM');
  protected fields = new Map<string, Field>();
  protected onSubmit: (fields: Record<string, FieldValue>) => Promise<unknown>;

  constructor(
    protected formId: string,
    options: InitialFormOptions,
    protected eventBus: EventBus
  ) {
    this.currentState = FormState.NOT_SUBMITTABLE;
    this.handleUpdates = this.handleUpdates.bind(this);
    this.validate = this.validate.bind(this);
    this.onSubmit = options.onSubmit;

    // Create fields
    Object.entries(options.fields).forEach(([fieldName, fieldData]) => {
      const fieldInstance = this.createField(this.formId, fieldName, fieldData);
      this.fields.set(fieldName, fieldInstance);
    });

    this.eventBus.subscribe(this.formId, 'form', this.handleUpdates);
  }

  handleUpdates(event: FormEvent): void {
    const { type } = event;

    if (type === 'REQUEST_FORM_DATA' || type === 'SET_FIELD_VALUE') {
      this.publishFormData();
    }
  }

  protected abstract createField(
    formId: string,
    fieldId: string,
    fieldData: unknown
  ): Field;
  abstract validate(): void;

  private publishFormData() {
    this.eventBus.publish(this.formId, {
      type: 'FORM_DATA_RESPONSE',
      formId: this.formId,
      formData: {
        currentState: this.currentState,
        fields: this.getFieldValues(),
      },
    });
  }

  getFieldValues = (): Record<string, FieldValue> => {
    const fields: Record<string, FieldValue> = {};

    this.fields.forEach((field, key) => {
      fields[key] = field.value;
    });

    return fields;
  };

  async submitForm(): Promise<void> {
    const fields = this.getFieldValues();
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
      this.currentState = state;
      this.eventBus.publish(this.formId, {
        type: 'FORM_UPDATED',
        formId: this.formId,
        formData: {
          currentState: this.currentState,
          fields: this.getFieldValues(),
        },
      });
    }
  }
}

export class BasicForm extends AbstractForm {
  protected createField(
    formId: string,
    fieldId: string,
    fieldData: InitialFieldData
  ): Field {
    const fieldInstance = new Field(
      new BasicField(
        fieldId,
        formId,
        fieldData,
        this.getFieldValues,
        this.eventBus
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
