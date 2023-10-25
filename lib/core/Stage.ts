/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionPayload, ActionKey } from './Actions';
import Field from './Field';
import FormStateManager, { FieldState, StageState } from './StateManager';

class Stage {
  id: string;
  currentState: StageState;
  fields = new Map<string, Field>();
  stateManager: FormStateManager;
  validateForm: () => void;

  constructor(
    id: string,
    fields: Record<string, any>,
    stageStateManager: FormStateManager,
    fieldStateManager: FormStateManager,
    private dispatch: (
      action: ActionKey,
      payload: ActionPayload<ActionKey>
    ) => void,
    validateForm: () => void
  ) {
    this.id = id;
    this.stateManager = stageStateManager;
    this.validateForm = validateForm;
    this.validate = this.validate.bind(this);

    Object.entries(fields).forEach(([fieldName, field]) => {
      this.fields.set(
        fieldName,
        new Field(
          fieldName,
          id,
          field,
          fieldStateManager,
          this.dispatch,
          this.validate
        )
      );
    });

    this.currentState = this.allFieldsValid()
      ? StageState.COMPLETE
      : StageState.INCOMPLETE;
  }

  validate() {
    if (this.allFieldsValid()) {
      this.goToState(StageState.COMPLETE);
    } else {
      this.goToState(StageState.INCOMPLETE);
    }
  }

  private allFieldsValid(): boolean {
    const results: boolean[] = [];
    this.fields.forEach((Field) => {
      results.push(Field.currentState === FieldState.VALID);
    });

    return results.every((state) => state);
  }

  private goToState(state: StageState) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch('SET_STAGE_STATE', {
        value: state,
        path: this.id,
      });
    }
    this.validateForm(); // validate form
  }
}

export default Stage;
