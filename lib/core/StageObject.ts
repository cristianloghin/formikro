/* eslint-disable @typescript-eslint/no-explicit-any */
import FieldObject from './FieldObject';

class StageObject {
  // currentState: string;
  id: string;
  fields = new Map<string, FieldObject>();

  constructor(id: string, fields: Record<string, any>) {
    // this.currentState = `${stageName}_INVALID`;
    this.id = id;
    Object.entries(fields).forEach(([fieldName, field]) => {
      this.fields.set(fieldName, new FieldObject(fieldName, id, field));
    });
  }
}

export default StageObject;
