/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, BasicForm, MultistageForm } from './Form';
import { Client } from './Client';
import { FormikroOptions } from '../hooks/useFormikro';
import { FieldValue } from 'react-formikro';
import { NewClient } from './NewClient';
import { NewEventBus } from './NewEventBus';

class NewGlobal {
  private static instance: NewGlobal;
  private eventBus = new NewEventBus();
  private forms = new Map<string, Form>();
  private clients = new Map<string, NewClient>();

  static getInstance(): NewGlobal {
    if (!NewGlobal.instance) {
      NewGlobal.instance = new NewGlobal();
    }
    return NewGlobal.instance;
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
      this.updateProxyWithForm(formId, formInstance);
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

  getClient(id: string): NewClient {
    if (!this.clients.has(id)) {
      if (this.forms.has(id)) {
        this.clients.set(id, new NewClient(this.getForm(id)));
      } else {
        // Create a form Proxy
        const formProxyHandler = {
          get: (target: any, prop: string) => {
            // Handle property access on the proxy
            // You can queue actions here if needed
            return target[prop];
          },

          set: (target: any, prop: string, value: any) => {
            // Handle setting properties on the proxy
            // You can queue updates here if needed
            target[prop] = value;
            return true;
          },
        };
        const emptyForm = {} as Form;
        const formProxy = new Proxy(emptyForm, formProxyHandler);

        this.clients.set(id, new NewClient(id, formProxy, this.eventBus));
      }
    }

    return this.clients.get(id)!;
  }

  private updateProxyWithForm(formId: string, formInstance: Form) {
    if (this.clients.has(formId)) {
      const client = this.clients.get(formId) as NewClient;
      client.updateForm(formInstance);
    }
  }
}

const instance = NewGlobal.getInstance();
export default instance;
