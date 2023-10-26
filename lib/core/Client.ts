/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionKey, ActionPayload } from './Actions';
import StageManager from './StageManager';
import { StageState } from './StateManager';

class Client {
  private stageManager: StageManager;
  private getActiveStage: () => [string, StageState];

  constructor(
    private metadata: { formId: string },
    stages: string[],
    getActiveStage: () => [string, StageState],
    private dispatch: (
      action: ActionKey,
      payload: ActionPayload<ActionKey>
    ) => void
  ) {
    this.stageManager = new StageManager(stages, this.dispatch);
    this.getActiveStage = getActiveStage;
  }

  getFormId(): string {
    return this.metadata.formId;
  }

  goToNextStage() {
    const [activeStage] = this.getActiveStage();
    this.stageManager.goToNextStage(activeStage);
  }

  goToPreviousStage() {
    const [activeStage] = this.getActiveStage();
    this.stageManager.goToPreviousStage(activeStage);
  }

  getStages(): {
    previous: string | undefined;
    active: string;
    activeState: StageState;
    next: string | undefined;
  } {
    const [active, activeState] = this.getActiveStage();
    const previous = this.stageManager.getPrevious(active);
    const next = this.stageManager.getNext(active);

    return {
      previous,
      active,
      activeState,
      next,
    };
  }
}

export default Client;
