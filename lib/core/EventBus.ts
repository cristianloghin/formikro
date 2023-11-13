import { FieldData, FieldValue } from './Field';

export type FormEvent =
  | {
      action: 'FIELD_UPDATED' | 'FIELD_INITIALIZED';
      fieldId: string;
      fieldData: FieldData;
    }
  | {
      action: 'UPDATE_FIELD';
      fieldId: string;
      value: FieldValue;
    }
  | { action: 'INITIALIZE_FIELD'; fieldId: string }
  | { action: 'SUBMIT_FORM' };

type Observer = (event: FormEvent) => void;

export class EventBus {
  private observers = new Map<string, Set<Observer>>();

  subscribe(formId: string, observer: Observer) {
    if (!this.observers.has(formId)) {
      this.observers.set(formId, new Set());
    }
    this.observers.get(formId)!.add(observer);
  }

  unsubscribe(formId: string, observer: Observer) {
    this.observers.get(formId)!.delete(observer);

    if (this.observers.get(formId)?.size === 0) {
      this.observers.delete(formId);
    }
  }

  publish(formId: string, event: FormEvent) {
    try {
      console.log('📣', event);
      const targetObservers = this.observers.get(formId);
      targetObservers?.forEach((observer) => observer(event));
    } catch (error) {
      console.error(`Error occurred while publishing event: ${error}`);
    }
  }
}
