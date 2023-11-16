import { EventBus, FormEvent } from './EventBus';
import { Observer } from './Observer';

export class Client {
  private observers = new Map<string, Map<string, Observer>>();

  constructor(private id: string, private eventBus: EventBus) {
    this.handleUpdates = this.handleUpdates.bind(this);
    this.eventBus.subscribe(this.id, 'client', this.handleUpdates);
  }

  // receive events from forms
  private handleUpdates(event: FormEvent) {
    const { type } = event;

    if (type === 'FIELD_DATA_RESPONSE') {
      const { fieldId, fieldData } = event;
      this.notifyObservers(fieldId, fieldData);
    }

    if (type === 'FORM_UPDATED' || type === 'FORM_DATA_RESPONSE') {
      const { formId, formData } = event;
      this.notifyObservers(formId, formData);
    }
  }

  // dispatch events to forms
  dispatchEvent(event: FormEvent) {
    this.eventBus.publish(this.id, event);
  }

  // set up client observers
  subscribe(id: string, observerUID: string, observer: Observer): () => void {
    if (!this.observers.has(id)) {
      const observersMap = new Map();
      observersMap.set(observerUID, observer);
      this.observers.set(id, observersMap);
    } else {
      const observersMap = this.observers.get(id)!;
      observersMap.set(observerUID, observer);
    }
    // unsubscribe
    return () => {
      const observersMap = this.observers.get(id);
      observersMap?.delete(observerUID);
      if (observersMap?.size === 0) {
        this.observers.delete(id);
      }
    };
  }

  // notify client observers about state updates
  private notifyObservers(id: string, data: unknown) {
    const observersMap = this.observers.get(id);
    if (observersMap) {
      observersMap.forEach((observer) => {
        observer.call(data);
      });
    }
  }
}
