import { FieldData } from './Field';
import { StageData } from './Stage';
import { FormData } from './Form';

export interface Observer {
  call(data: unknown): void;
}

export class FieldObserver implements Observer {
  constructor(private callback: (data: FieldData) => void) {}

  call(data: FieldData): void {
    this.callback(data);
  }
}

export class FormObserver implements Observer {
  constructor(private callback: (data: FormData) => void) {}

  call(data: FormData): void {
    this.callback(data);
  }
}

export class StageObserver implements Observer {
  constructor(private callback: (data: StageData) => void) {}

  call(data: StageData): void {
    this.callback(data);
  }
}
