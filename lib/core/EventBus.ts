import { FieldData, FieldValue } from './Field';
import { FormData } from './Form';
import { StageState } from './StateManager';

export type FormEvent =
  | { type: 'REQUEST_FIELD_DATA'; fieldId: string }
  | {
      type: 'SET_FIELD_VALUE';
      fieldId: string;
      value: FieldValue;
    }
  | {
      type: 'FIELD_DATA_RESPONSE';
      fieldId: string;
      fieldData: FieldData;
    }
  | { type: 'REQUEST_FORM_DATA' }
  | { type: 'SUBMIT_FORM' }
  | { type: 'VALIDATE_FORM' }
  | {
      type: 'FORM_UPDATED' | 'FORM_DATA_RESPONSE';
      formId: string;
      formData: FormData<unknown>;
    }
  | {
      type: 'STAGE_UPDATED';
      stageId: string;
      stageData: { currentState: StageState };
    };

type EventObserver = (event: FormEvent) => void;

export class EventBus {
  private observers = new Map<string, Map<string, EventObserver>>();

  subscribe(formId: string, observerID: string, observer: EventObserver) {
    console.log('🚌 subscribe', formId, observerID);

    if (!this.observers.has(formId)) {
      const observersMap = new Map();
      observersMap.set(observerID, observer);

      this.observers.set(formId, observersMap);
    } else {
      const observersMap = this.observers.get(formId)!;
      observersMap.set(observerID, observer);
    }
  }

  // unsubscribe

  publish(formId: string, event: FormEvent) {
    try {
      console.log('📣', formId, event);
      const targetObservers = this.observers.get(formId);
      targetObservers?.forEach((observer) => observer(event));
    } catch (error) {
      console.error(`Error occurred while publishing event: ${error}`);
    }
  }
}
