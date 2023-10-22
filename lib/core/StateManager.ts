export type StateTransition = {
  canChangeState: (nextStage: string) => boolean;
  changeState: () => void;
};

export type NodeType = 'FORM' | 'STAGE' | 'FIELD';

export enum FormState {
  SUBMITTABLE = 'SUBMITTABLE',
  NOT_SUBMITTABLE = 'NOT_SUBMITTABLE',
}

export enum FieldState {
  VALID = 'VALID',
  INVALID = 'INVALID',
  DISABLED = 'DISABLED',
}

interface State {
  canChangeState(currentState: string, newState: string): boolean;
}

class NodeState implements State {
  private nodeType: NodeType;
  private stateTransitions: Map<string, string[]> = new Map();

  constructor(nodeType: NodeType, stages?: string[]) {
    this.nodeType = nodeType;

    switch (this.nodeType) {
      case 'FORM':
        this.stateTransitions.set(FormState.SUBMITTABLE, [
          FormState.NOT_SUBMITTABLE,
        ]);
        this.stateTransitions.set(FormState.NOT_SUBMITTABLE, [
          FormState.SUBMITTABLE,
        ]);
        break;
      case 'FIELD':
        this.stateTransitions.set(FieldState.VALID, [
          FieldState.INVALID,
          FieldState.DISABLED,
        ]);
        this.stateTransitions.set(FieldState.INVALID, [
          FieldState.VALID,
          FieldState.DISABLED,
        ]);
        this.stateTransitions.set(FieldState.DISABLED, [
          FieldState.VALID,
          FieldState.INVALID,
        ]);
        break;
      case 'STAGE':
        if (stages) {
          stages.forEach((stage, index) => {
            const nextState =
              index < stages.length
                ? `${stages[index + 1]}_INVALID`
                : undefined;

            const currentState = {
              invalid: `${stage.toUpperCase()}_INVALID`,
              valid: `${stage.toUpperCase()}_VALID`,
            };
            this.stateTransitions.set(currentState.invalid, [
              currentState.valid,
            ]);
            this.stateTransitions.set(
              currentState.valid,
              nextState
                ? [currentState.invalid, nextState]
                : [currentState.invalid]
            );
          });
        }
        break;
    }
  }

  canChangeState(currentState: string, newState: string): boolean {
    const allowedTransitions = this.stateTransitions.get(currentState);
    return !!allowedTransitions && allowedTransitions.includes(newState);
  }
}

interface StateManager {
  canTransitionTo(
    formId: string,
    currentStage: string,
    nextStage: string
  ): boolean;
  // transitionTo(
  //   formId: string,
  //   currentStage: string,
  //   nextStage: string
  // ): boolean;
}

class FormStateManager implements StateManager {
  private stateInstances: Map<NodeType, State> = new Map();

  constructor(stages: string[]) {
    this.stateInstances.set('FORM', new NodeState('FORM'));
    this.stateInstances.set('FIELD', new NodeState('FIELD'));
    this.stateInstances.set('STAGE', new NodeState('STAGE', stages));
  }

  canTransitionTo(
    nodeType: NodeType,
    currentState: string,
    nextState: string
  ): boolean {
    const stateInstance = this.stateInstances.get(nodeType);

    if (
      stateInstance &&
      stateInstance.canChangeState(currentState, nextState)
    ) {
      return true;
    }

    return false;
  }

  // transitionTo(
  //   formId: string,
  //   currentStage: string,
  //   nextStage: string
  // ): boolean {
  //   const formTransitions = this.stateTransitions.get(formId);

  //   if (formTransitions) {
  //     if (this.canTransitionTo(formId, currentStage, nextStage)) {
  //       const transition = formTransitions.get(nextStage);
  //       transition?.changeState();
  //       return true;
  //     }
  //   }

  //   return false;
  // }
}

export default FormStateManager;
