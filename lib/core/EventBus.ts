import { Field, FieldValue } from './Field';

type ActionType = 'FIELD_UPDATED' | 'SET_FIELD_VALUE';
type ActionPayload = { fieldId: string; value: FieldValue } & {
  fieldId: string;
  field: Field;
};

export type FormEvent = {
  action: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: ActionPayload;
};
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
      const targetObservers = this.observers.get(formId);
      targetObservers?.forEach((observer) => observer(event));
    } catch (error) {
      console.error(`Error occurred while publishing event: ${error}`);
    }
  }
}
