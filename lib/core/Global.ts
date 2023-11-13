import { InitialFormOptions, Form, BasicForm, FormType } from './Form';
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

  initialize<T>(formId: string, options: FormikroOptions<T>) {
    if (!this.forms.has(formId) || this.forms.get(formId)?.isProxy) {
      const formInstance = new Form(
        new BasicForm(formId, options as InitialFormOptions, this.eventBus)
      );

      this.forms.set(formId, formInstance);
    }
  }

  getForm(formId: string): FormType | undefined {
    return this.forms.get(formId)?.type;
  }

  getClient(formId: string): Client {
    // Create FormProxy if client created before form
    if (!this.forms.has(formId)) {
      const formProxy = this.getFormProxy();
      this.forms.set(formId, formProxy);
    }

    // Create a form client
    if (!this.clients.has(formId)) {
      this.clients.set(formId, new Client(formId, this.eventBus));
    }

    return this.clients.get(formId)!;
  }

  private getFormProxy(): Form {
    const formProxyHandler = {
      get: (target: Form, prop: keyof Form) => {
        // Handle property access on the proxy
        return target[prop];
      },

      set: (target: Form, prop: keyof Form, value: boolean & FormType) => {
        // Handle setting properties on the proxy
        target[prop] = value;
        return true;
      },
    };
    const emptyForm = { isProxy: true } as unknown as Form;
    return new Proxy(emptyForm, formProxyHandler);
  }
}

const instance = Global.getInstance();
export default instance;
