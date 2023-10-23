import FormObject from './FormObject';
import { DynamicFields } from '../core/types';

export type FieldValue = string | number | undefined;

class Formikro {
  private static instance: Formikro;
  private forms = new Map<string, FormObject>();

  static getInstance(): Formikro {
    if (!Formikro.instance) {
      Formikro.instance = new Formikro();
    }
    return Formikro.instance;
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
}

const instance = Formikro.getInstance();
export default instance;
