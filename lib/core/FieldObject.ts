/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldValue } from './State';
// import { FieldState } from './StateManager';

class FieldObject {
  id: string;
  stageId: string;
  initialValue: FieldValue;
  value: FieldValue;
  // stageId: string;
  // currentState: FieldState;
  // value: FieldValue;

  constructor(id: string, stageId: string, data: Record<string, any>) {
    this.id = id;
    this.stageId = stageId;
    this.initialValue = data.initialValue;
    this.value = data.initialValue;
    // this.stageId = stageId;
    // this.currentState = FieldState.INVALID;
  }
}

export default FieldObject;
