import { Form } from './Form';
import { FieldValue } from './Field';
import { NewEventBus } from './NewEventBus';

class NewClient {
  private uid: string;

  constructor(
    private id: string,
    private form: Form,
    private eventBus: NewEventBus
  ) {
    this.uid = Math.random().toString(36).substring(2, 8);
    this.eventBus.subscribe(
      this.id,
      'FORM_UPDATE',
      this.handleFormUpdate,
      this.uid
    );
  }

  private handleFormUpdate() {}

  get fields(): Record<string, FieldValue> {
    return this.form.fields;
  }

  updateForm(newForm: Form) {
    this.form = newForm;
  }
}

export { NewClient };
