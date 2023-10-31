import { ActionKey } from './Actions';

export type FormObserver = () => void;

// A centralized EventBus that both mutates state and notifies observers
export class EventBus {
  private observers = new Map<string, Map<string, FormObserver>>();

  subscribe(action: ActionKey, observer: FormObserver, uid: string) {
    if (!this.observers.has(action)) {
      const observerMap = new Map<string, FormObserver>();
      observerMap.set(uid, observer);
      this.observers.set(action, observerMap);
    } else {
      this.observers.get(action)?.set(uid, observer);
    }
  }

  unsubscribe(action: ActionKey, uid: string) {
    this.observers.get(action)?.delete(uid);
    if (this.observers.get(action)?.size === 0) {
      this.observers.delete(action);
    }
  }

  publish(action: ActionKey, uid?: string) {
    if (uid) {
      const observer = this.observers.get(action)?.get(uid);
      if (observer) observer();
    } else {
      const observers = this.observers.get(action);
      if (observers) observers.forEach((observer) => observer());
    }
  }
}
