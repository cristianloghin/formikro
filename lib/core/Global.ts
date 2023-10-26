import Form from './Form';
import { DynamicFields } from './types';

export type FieldValue = string | number | undefined;

class Global {
  private static instance: Global;
  private forms = new Map<string, Form>();

  static getInstance(): Global {
    if (!Global.instance) {
      Global.instance = new Global();
    }
    return Global.instance;
  }

  initialize<T>(formId: string, data: Record<string, DynamicFields<T>>): Form {
    let form = this.forms.get(formId);

    if (!form) {
      form = new Form(formId, data);
      this.forms.set(formId, form);
    }

    return form;
  }

  getForm(formName: string): Form {
    const Form = this.forms.get(formName);

    if (!Form) {
      throw `${formName} does not exist.`;
    }

    return Form;
  }
}

const instance = Global.getInstance();
export default instance;
