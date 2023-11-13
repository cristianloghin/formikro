import { FieldData } from './Field';
import { EventBus, FormEvent } from './EventBus';

export class Client {
  formId: string;
  private observers = new Map<string, (field: FieldData) => void>();

  constructor(formId: string, private eventBus: EventBus) {
    this.formId = formId;
    this.handleUpdates = this.handleUpdates.bind(this);
    this.eventBus.subscribe(this.formId, this.handleUpdates);
  }

  // receive events from forms
  private handleUpdates(event: FormEvent) {
    switch (event.action) {
      case 'FIELD_UPDATED': {
        const { fieldId, fieldData } = event;
        if (this.observers.has(fieldId)) {
          const fieldObserver = this.observers.get(fieldId)!;
          fieldObserver(fieldData);
        }
        break;
      }
      case 'FIELD_INITIALIZED': {
        const { fieldId, fieldData } = event;
        if (this.observers.has(fieldId)) {
          const fieldObserver = this.observers.get(fieldId)!;
          fieldObserver(fieldData);
        }
        break;
      }
    }
  }

  // dispatch events to forms
  dispatchEvent(event: FormEvent) {
    this.eventBus.publish(this.formId, event);
  }

  // set up client observers
  subscribe(id: string, observer: (field: Partial<FieldData>) => void) {
    this.observers.set(id, observer);
    // unsubscribe
    return () => this.observers.delete(id);
  }
}
