import FormWorker from './Worker';
import FormEventBus from './EventBus';

import FormObject from './FormObject';
import { DynamicFields } from '../core/types';

export type FieldValue = string | number | undefined;

export interface Formikro {
  initialize<T>(formId: string, stages: Record<string, DynamicFields<T>>): void;
  // canTransitionTo(
  //   formId: string,
  //   nodeType: NodeType,
  //   nextStage: string
  // ): boolean;
  // transitionTo(formId: string, nextStage: string): void;
  // dispatch(formId: string, action: string, payload: unknown): void;
}

class Form implements Formikro {
  private static instance: Form;
  private worker = new FormWorker();
  private eventBus = new FormEventBus();
  private forms = new Map<string, FormObject>();

  static getInstance(): Form {
    if (!Form.instance) {
      Form.instance = new Form();
    }
    return Form.instance;
  }

  initialize<T>(
    formId: string,
    data: Record<string, DynamicFields<T>>
  ): FormObject {
    let form = this.forms.get(formId);

    if (!form) {
      form = new FormObject(formId, data);
      this.forms.set(formId, form);
    }

    return form;
  }

  // canTransitionTo(
  //   formId: string,
  //   nodeType: NodeType,
  //   nextStage: string
  // ): boolean {
  //   const form = this.forms.get(formId);
  //   const currentState = form?.currentState;
  //   const formStateManager = form?.stateManager;

  //   if (currentState && formStateManager) {
  //     return formStateManager.canTransitionTo(
  //       nodeType,
  //       currentState,
  //       nextStage
  //     );
  //   }

  //   return false;
  // }

  // transitionTo(formId: string, nextStage: string): void {
  //   const form = this.forms.get(formId);
  //   const currentStage = form?.currentState;

  //   if (
  //     currentStage &&
  //     this.stateManager.transitionTo(formId, currentStage, nextStage)
  //   ) {
  //     form.currentState = nextStage; // Update Singleton's state
  //     this.eventBus.publish('STATE_CHANGED', form);
  //   }
  // }

  // dispatch<ActionType extends keyof typeof FORM_ACTIONS>(
  //   formId: string,
  //   action: ActionType,
  //   payload: Parameters<(typeof FORM_ACTIONS)[ActionType]>[0]
  // ) {
  //   const form = this.forms.get(formId);

  //   if (form) {
  //     const command = new FormCommand(this.worker, action, payload, form);

  //     // Mutate using command
  //     this.forms.set(formId, command.execute());

  //     // Notify observers
  //     this.eventBus.publish(action, form);
  //   }
  // }
}

const instance = Form.getInstance();
export default instance;
