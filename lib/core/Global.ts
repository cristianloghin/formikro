/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, BasicForm, MultistageForm } from './Form';
import { Client } from './Client';
import { FormikroOptions } from '../hooks/useFormikro';
import { FieldValue } from 'react-formikro';

class Global {
  private static instance: Global;
  private forms = new Map<string, Form>();

  static getInstance(): Global {
    if (!Global.instance) {
      Global.instance = new Global();
    }
    return Global.instance;
  }

  initialize<T, K extends string>(
    formId: string,
    options: FormikroOptions<T, K>
  ): Client {
    let formInstance = this.forms.get(formId);

    if (!formInstance) {
      if (!options.stages) {
        formInstance = new Form(
          new BasicForm(
            formId,
            options.onSubmit as (
              fields: Record<string, FieldValue>
            ) => Promise<unknown>,
            options.fields
          )
        );
      } else {
        formInstance = new Form(
          new MultistageForm(
            formId,
            options.onSubmit as (
              fields: Record<string, FieldValue>
            ) => Promise<unknown>,
            options.fields,
            options.stages
          )
        );
      }
      this.forms.set(formId, formInstance);
    }

    return formInstance.getClient();
  }

  getForm(formName: string): Form {
    const Form = this.forms.get(formName);

    if (!Form) {
      throw new Error(`${formName} does not exist.`);
    }

    return Form;
  }
}

const instance = Global.getInstance();
export default instance;
