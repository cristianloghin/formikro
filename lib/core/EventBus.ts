import { FormObserver, FormState } from './types';

// A centralized EventBus that both mutates state and notifies observers

class FormEventBus {
  private observers = new Map<string, Map<string, FormObserver>>();

  subscribe(action: string, observer: FormObserver, uid: string) {
    if (!this.observers.has(action)) {
      const observerMap = new Map<string, FormObserver>();
      observerMap.set(uid, observer);

      this.observers.set(action, observerMap);
    }
  }

  unsubscribe(action: string, uid: string) {
    this.observers.get(action)?.delete(uid);
    if (this.observers.get(action)?.size === 0) {
      this.observers.delete(action);
    }
  }

  publish(
    state: FormState,
    action: string,
    path: string | [string, string] | undefined
  ) {
    let targetObservers: Map<string, FormObserver> | undefined;

    if (path) {
      const target = `${action}:${Array.isArray(path) ? path.join(':') : path}`;
      targetObservers = this.observers.get(target);
    } else {
      targetObservers = this.observers.get(action);
    }

    if (targetObservers) {
      targetObservers.forEach((callback) => {
        callback(state);
      });
    }
  }
}

export default FormEventBus;
