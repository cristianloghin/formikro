import { Field } from './Field';
import { Stage } from './Stage';
import { StageState } from './StateManager';
import { FieldValue } from 'react-formikro';
import { EventBus, FormEvent } from './EventBus';

export class Client {
  private observers = new Map<string, (field: Field) => void>();

  constructor(private formId: string, private eventBus: EventBus) {
    this.eventBus.subscribe(this.formId, this.handleUpdates);
  }

  private handleUpdates(event: FormEvent) {
    switch (event.action) {
      case 'FIELD_UPDATED': {
        const { fieldId, field } = event.payload;
        if (this.observers.has(fieldId)) {
          const fieldObserver = this.observers.get(fieldId)!;
          fieldObserver(field);
        }
      }
    }
  }

  dispatchEvent(event: FormEvent) {
    this.eventBus.publish(this.formId, event);
  }

  subscribe(fieldId: string, observer: (field: Field) => void) {
    this.observers.set(fieldId, observer);
    // unsubscribe
    return () => this.observers.delete(fieldId);
  }

  getField(id: string): Field | null {
    return this.formType.getField(id);
  }

  get fields(): Record<string, FieldValue> {
    return this.formType.getFields();
  }

  async submitForm(): Promise<void> {
    return this.formType.submitForm();
  }

  getStage(id: string): Stage | null {
    if ('getStage' in this.formType) {
      return this.formType.getStage!(id);
    } else {
      return null;
    }
  }

  get activeStageState(): StageState | null {
    if ('currentStage' in this.formType) {
      return this.formType.currentStage!.currentState;
    } else {
      return null;
    }
  }

  get activeStageIndex(): number | null {
    if ('currentStage' in this.formType) {
      return this.formType.currentStage!.index;
    } else {
      return null;
    }
  }

  get totalStages(): number | null {
    if ('stages' in this.formType) {
      return this.formType.stages!.size;
    } else {
      return null;
    }
  }

  goToStage(target: 'previous' | 'next') {
    if ('goToStage' in this.formType) {
      this.formType.goToStage!(target);
    } else {
      return null;
    }
  }

  get formState() {
    return this.formType.getFormState();
  }
}
