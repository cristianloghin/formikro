import { FormDispatch } from './Form';

export class StageManager {
  private transitions = new Map<
    string,
    { next: string | undefined; previous: string | undefined }
  >();

  constructor(stages: string[], private dispatch: FormDispatch) {
    if (stages.length === 1) {
      this.transitions.set(stages[0], { next: undefined, previous: undefined });
    } else {
      stages.forEach((stage, index) => {
        if (index === 0) {
          this.transitions.set(stage, { next: stages[1], previous: undefined });
        } else if (index === stages.length - 1) {
          this.transitions.set(stage, {
            next: undefined,
            previous: stages[index - 1],
          });
        } else {
          this.transitions.set(stage, {
            next: stages[index + 1],
            previous: stages[index - 1],
          });
        }
      });
    }
  }

  private hasNextStage(current: string): boolean {
    return !!this.transitions.get(current)?.next;
  }

  private hasPreviousStage(current: string): boolean {
    return !!this.transitions.get(current)?.previous;
  }

  goToNextStage(current: string) {
    if (this.hasNextStage(current)) {
      const nextStage = this.transitions.get(current)!.next as string;
      this.dispatch('SET_ACTIVE_STAGE', { current, active: nextStage });
    }
  }

  goToPreviousStage(current: string) {
    if (this.hasPreviousStage(current)) {
      const previousStage = this.transitions.get(current)!.previous as string;
      this.dispatch('SET_ACTIVE_STAGE', {
        current,
        active: previousStage,
      });
    }
  }
}
