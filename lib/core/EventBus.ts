import FormObject from './FormObject';

// A centralized EventBus that both mutates state and notifies observers
type FormObserver = (form: FormObject) => void;

interface EventBus {
  subscribe(action: string, observer: FormObserver): void;
  publish(action: string, form: FormObject): void;
}

class FormEventBus implements EventBus {
  private observers: Record<string, FormObserver[]> = {};

  subscribe(action: string, observer: FormObserver) {
    if (!this.observers[action]) {
      this.observers[action] = [];
    }
    this.observers[action].push(observer);
  }

  publish(action: string, form: FormObject) {
    if (this.observers[action]) {
      this.observers[action].forEach((observer) => observer(form));
    }
  }
}

export default FormEventBus;
