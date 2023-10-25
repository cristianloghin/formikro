export type StateTransition = {
  canChangeState: (nextStage: string) => boolean;
  changeState: () => void;
};

export type NodeType = 'FORM' | 'STAGE' | 'FIELD';

export enum FormState {
  SUBMITTABLE = 'SUBMITTABLE',
  NOT_SUBMITTABLE = 'NOT_SUBMITTABLE',
}

export enum StageState {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETE = 'COMPLETE',
}

export enum FieldState {
  VALIDATING = 'VALIDATING',
  VALID = 'VALID',
  INVALID = 'INVALID',
}

interface State {
  canChangeState(currentState: string, newState: string): boolean;
}

class NodeState implements State {
  private stateTransitions: Map<string, string[]> = new Map();

  constructor(nodeType: NodeType) {
    switch (nodeType) {
      case 'FORM':
        this.stateTransitions.set(FormState.NOT_SUBMITTABLE, [
          FormState.SUBMITTABLE,
        ]);
        this.stateTransitions.set(FormState.SUBMITTABLE, [
          FormState.NOT_SUBMITTABLE,
        ]);
        break;
      case 'STAGE':
        this.stateTransitions.set(StageState.INCOMPLETE, [StageState.COMPLETE]);
        this.stateTransitions.set(StageState.COMPLETE, [StageState.INCOMPLETE]);
        break;
      case 'FIELD':
        this.stateTransitions.set(FieldState.VALIDATING, [
          FieldState.INVALID,
          FieldState.VALID,
        ]);
        this.stateTransitions.set(FieldState.VALID, [
          FieldState.VALIDATING,
          FieldState.INVALID,
        ]);
        this.stateTransitions.set(FieldState.INVALID, [
          FieldState.VALIDATING,
          FieldState.VALID,
        ]);
        break;
    }
  }

  canChangeState(currentState: string, newState: string): boolean {
    const allowedTransitions = this.stateTransitions.get(currentState);
    return !!allowedTransitions && allowedTransitions.includes(newState);
  }
}

class FormStateManager {
  private stateInstance: State;

  constructor(node: NodeType) {
    this.stateInstance = new NodeState(node);
  }

  canTransitionTo(currentState: string, nextState: string): boolean {
    const stateInstance = this.stateInstance;
    if (stateInstance.canChangeState(currentState, nextState)) {
      return true;
    }

    return false;
  }
}

export default FormStateManager;
