import { FormDispatch } from './Form';
import { StateManager, StageState } from './StateManager';

export type StageData = {
  currentState: StageState;
};

export class Stage {
  id: string;
  index: number;
  uid: string;
  formId: string;
  isActive: boolean;
  currentState: StageState;
  private stateManager = new StateManager('STAGE');

  constructor(
    formId: string,
    id: string,
    index: number,
    private stageFieldsValid: (id: string) => boolean,
    private dispatch: FormDispatch
  ) {
    this.id = id;
    this.uid = Math.random().toString(36).substring(2, 8);
    this.index = index;
    this.formId = formId;
    this.isActive = index === 0;
    this.currentState = stageFieldsValid(id)
      ? StageState.COMPLETE
      : StageState.INCOMPLETE;
  }

  validate() {
    if (this.stageFieldsValid(this.id)) {
      this.goToState(StageState.COMPLETE);
    } else {
      this.goToState(StageState.INCOMPLETE);
    }
  }

  private goToState(state: StageState) {
    if (this.stateManager.canTransitionTo(this.currentState, state)) {
      this.dispatch('SET_STAGE_STATE', {
        id: this.id,
        state,
      });
    }
  }
}
