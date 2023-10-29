import { StageState } from './__StateManager';

export class Stage {
  id: string;
  formId: string;
  isActive: boolean;
  currentState: StageState;
  private allFieldsValid: (id: string) => boolean;

  constructor(
    formId: string,
    id: string,
    isActive: boolean,
    stageFieldsValid: (id: string) => boolean
  ) {
    this.id = id;
    this.formId = formId;
    this.isActive = isActive;
    this.allFieldsValid = stageFieldsValid;
    this.currentState = stageFieldsValid(id)
      ? StageState.COMPLETE
      : StageState.INCOMPLETE;
  }

  validate() {
    if (this.allFieldsValid(this.id)) {
      this.goToState(StageState.COMPLETE);
    } else {
      this.goToState(StageState.INCOMPLETE);
    }
  }
}
