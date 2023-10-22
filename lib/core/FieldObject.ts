/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldValue } from './State';
import { FieldSideEffects } from './types';
// import { FieldState } from './StateManager';

class FieldObject {
  id: string;
  stageId: string;
  initialValue: FieldValue;
  value: FieldValue;
  sideEffects?: FieldSideEffects<Record<string, any>>;
  // stageId: string;
  // currentState: FieldState;

  constructor(id: string, stageId: string, data: Record<string, any>) {
    this.id = id;
    this.stageId = stageId;
    this.initialValue = data.initialValue;
    this.value = data.initialValue;
    this.sideEffects = data.sideEffects;
    // this.currentState = FieldState.INVALID;
  }
}

export default FieldObject;
