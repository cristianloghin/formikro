/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, BasicForm, MultistageForm } from './Form';
import { Client } from './Client';
import { FormikroOptions } from '../hooks/useFormikro';
import { EventBus } from './EventBus';

class Global {
  private static instance: Global;
  private eventBus = new EventBus();
  private clients = new Map<string, Client>();
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
  ) {
    if (!this.forms.has(formId)) {
      let formInstance: Form;

      if (!options.stages) {
        formInstance = new Form(formId, new BasicForm(options), this.eventBus);
      } else {
        formInstance = new Form(
          formId,
          new MultistageForm(options),
          this.eventBus
        );
      }
      this.forms.set(formId, formInstance);
    }
  }

  getClient(formId: string): Client {
    if (!this.forms.has(formId)) {
      // Create a form Proxy
      const formProxyHandler = {
        get: (target: any, prop: string) => {
          // Handle property access on the proxy
          return target[prop];
        },

        set: (target: any, prop: string, value: any) => {
          // Handle setting properties on the proxy
          target[prop] = value;
          return true;
        },
      };
      const emptyForm = {} as Form;
      const formProxy = new Proxy(emptyForm, formProxyHandler);

      this.forms.set(formId, formProxy);
    }

    if (!this.clients.has(formId)) {
      // Create a form client
      this.clients.set(formId, new Client(formId, this.eventBus));
    }

    return this.clients.get(formId)!;
  }
}

const instance = Global.getInstance();
export default instance;
