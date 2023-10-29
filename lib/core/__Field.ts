/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionPayload, ActionKey } from './Actions';
import { FieldValue } from './Global';
import FormStateManager, { FieldState } from './__StateManager';
import { FieldSideEffects } from './types';

class Field {
  id: string;
  stageId: string;
  isRequired: boolean;
  initialValue: FieldValue;
  value: FieldValue;
  sideEffects?: FieldSideEffects<Record<string, any>>;

  stateManager: FormStateManager;
  currentState: FieldState;
  validateStage: () => void;

  constructor(
    id: string,
    stageId: string,
    data: Record<string, any>,
    fieldStateManager: FormStateManager,
    private dispatch: (
      action: ActionKey,
      payload: ActionPayload<ActionKey>
    ) => void,
    validateStage: () => void
  ) {
    this.id = id;
    this.stageId = stageId;
    this.isRequired = data.isRequired;
    this.initialValue = data.initialValue;
    this.value = data.initialValue;
    this.sideEffects = data.sideEffects;

    this.currentState = data.initialValue
      ? FieldState.VALID
      : data.isRequired
      ? FieldState.INVALID
      : FieldState.VALID;

    this.stateManager = fieldStateManager;

    this.validateStage = validateStage;
    this.validate = this.validate.bind(this);
  }

  validate(value: FieldValue) {
    this.goToState(FieldState.VALIDATING);
    if (!value && this.isRequired) {
      this.goToState(FieldState.INVALID);
    } else {
      this.goToState(FieldState.VALID);
    }
  }

  private goToState(state: FieldState) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch('SET_FIELD_STATE', {
        value: state,
        path: [this.stageId, this.id],
      });
    }
    this.validateStage(); // trigger stage validation
  }
}

export default Field;
