import { EventBus, FormEvent } from './EventBus';
import { BasicField, Field, InitialFieldData, FieldValue } from './Field';
import { Stage } from './Stage';
import { FieldState, FormState, StateManager } from './StateManager';

export type FormData<T> = {
  currentState: FormState;
  fields: Record<Extract<keyof T, string>, Field>;
};

export type FormDispatch = (event: FormEvent) => void;

export interface Stageable {
  getStage(id: string): Stage | null;
  currentStage: Stage;
  stages: Map<string, Stage>;
  goToStage(target: 'next' | 'previous'): void;
}

export type InitialFormOptions = {
  submit: {
    submitFn: (fields: Record<string, FieldValue>) => Promise<unknown>;
    onSuccess?: (response: unknown) => void;
    onError?: (error: unknown) => void;
  };
  fields: Record<string, unknown>;
  stages?: string[];
};

export interface FormType {
  submitForm(): Promise<void>;
}

abstract class AbstractForm implements FormType {
  protected currentState: FormState;
  protected stateManager = new StateManager('FORM');
  protected fields = new Map<string, Field>();
  protected onSubmit: (fields: Record<string, FieldValue>) => Promise<unknown>;
  private onSubmitSuccess: ((response: unknown) => void) | undefined;
  private onSubmitError: ((error: unknown) => void) | undefined;

  constructor(
    protected formId: string,
    options: InitialFormOptions,
    protected eventBus: EventBus
  ) {
    this.currentState = FormState.NOT_SUBMITTABLE;
    this.handleUpdates = this.handleUpdates.bind(this);

    this.onSubmit = options.submit.submitFn;
    this.onSubmitSuccess = options.submit.onSuccess;
    this.onSubmitError = options.submit.onError;

    // Create fields
    Object.entries(options.fields).forEach(([fieldName, fieldData]) => {
      const fieldInstance = this.createField(this.formId, fieldName, fieldData);
      this.fields.set(fieldName, fieldInstance);
    });

    this.eventBus.subscribe(this.formId, 'form', this.handleUpdates);
  }

  private handleUpdates(event: FormEvent): void {
    const { type } = event;

    if (type === 'REQUEST_FORM_DATA' || type === 'SET_FIELD_VALUE') {
      this.publishFormData();
    }

    if (type === 'FIELD_DATA_RESPONSE') {
      const { fieldData } = event;
      // Change form state is a field is validating
      if (fieldData.currentState === FieldState.VALIDATING) {
        this.goToState(FormState.VALIDATING);
      }
    }

    if (type === 'VALIDATE_FORM') {
      this.validate();
    }

    if (type === 'SUBMIT_FORM') {
      this.submitForm();
    }
  }

  protected abstract validate(): void;
  protected abstract createField(
    formId: string,
    fieldId: string,
    fieldData: unknown
  ): Field;

  private publishFormData() {
    this.eventBus.publish(this.formId, {
      type: 'FORM_DATA_RESPONSE',
      formId: this.formId,
      formData: {
        currentState: this.currentState,
        fields: this.getFields(),
      },
    });
  }

  getFields = (options?: { exclude?: string[] }) => {
    const fields: Record<string, Field> = {};

    this.fields.forEach((field, key) => {
      if (options?.exclude) {
        if (!options.exclude.includes(key)) {
          fields[key] = field;
        }
      } else {
        fields[key] = field;
      }
    });

    return fields;
  };

  getFieldValues = (options?: { exclude?: string[]; valuesOnly?: boolean }) => {
    const fields: Record<string, FieldValue> = {};

    this.fields.forEach((field, key) => {
      if (options?.exclude) {
        if (!options.exclude.includes(key)) {
          fields[key] = field.value;
        }
      } else {
        fields[key] = field.value;
      }
    });

    return fields;
  };

  async submitForm(): Promise<void> {
    const fields = this.getFieldValues();
    this.goToState(FormState.SUBMITTING);

    return this.onSubmit(fields)
      .then((res) => {
        this.goToState(FormState.SUCCESS);
        if (this.onSubmitSuccess) {
          this.onSubmitSuccess(res);
        }
        return;
      })
      .catch((error) => {
        this.goToState(FormState.ERROR);
        if (this.onSubmitError) {
          this.onSubmitError(error);
        } else {
          throw error;
        }
      });
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
      this.publishFormData();
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
      new BasicField(fieldId, formId, fieldData, this.getFields, this.eventBus)
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
