import Stage from './Stage';
import { FormState as FormStateType } from './StateManager';

export type FieldValue = string | number | undefined;

export interface FieldProps<T> {
  id: Extract<keyof T, string>;
  label?: string;
}

export type FieldSideEffects<T> = {
  disable?: T[];
  clear?: T[];
  validate?: T[];
};

export type DynamicFields<T> = {
  [field in keyof Partial<T>]: {
    isRequired: boolean;
    initialValue?: T[field];
    disable?: (data: T) => boolean;
    validate?: (value: T[field]) => boolean;
    sideEffects?: FieldSideEffects<Exclude<keyof T, field>>;
  };
};

export type FormState = {
  currentState: FormStateType;
  stages: Map<string, Stage>;
};

export type FormObserver = (state: FormState) => void;
