/* eslint-disable @typescript-eslint/no-explicit-any */
import MMap from '../modules/MMap';
import actions, { Actions } from './actions';

export type Observer = (state: FormState) => void;

export type Event = {
  path: string[];
  action: (state: FormState) => FormState;
};

export type FieldValue = string | number | undefined;

export type Field = {
  isValid: boolean;
  stageId: string;
  value: FieldValue;
};

type Stage = {
  isValid: boolean;
};

type Transition = {
  isValid: string | null;
  isInvalid: string | null;
  previous: (() => string) | null;
  next: (() => string) | null;
};

type StateId = string;

export type FormState = {
  onSubmit: (data: Record<string, FieldValue>) => Promise<unknown>;
  initialValues: MMap<string, FieldValue>;
  currentState: StateId;
  states: MMap<StateId, Transition>;
  stages: MMap<string, Stage>;
  fields: MMap<string, Field>;
};

export interface FormikroClass {
  addForm<T extends Record<string, FieldValue>>(
    formId: string,
    options: FormOptions<T>
  ): void;

  setFieldState(formId: string, fieldId: string, isValid: boolean): void;
  getField(formId: string, fieldId: string): Field | undefined;

  addObserver(key: string[], observer: [string, Observer]): void;
  removeObserver(observerKey: string[], observerId: string): void;

  dispatch<ActionType extends keyof Actions>(
    path: string[],
    action: ActionType,
    payload: unknown
  ): void;
}

class Formikro implements FormikroClass {
  private static instance: Formikro;
  private forms = new MMap<string, FormState>();
  private observers = new MMap<string[], MMap<string, Observer>>();
  private eventQueue: Event[] = [];

  private constructor() {
    this.addForm = this.addForm.bind(this);
  }

  private transitionTo(form: FormState, next: string | (() => string)) {
    form.currentState = typeof next === 'function' ? next() : next;
  }

  canTransitionTo(formId: string, action: keyof Transition) {
    const form = this.forms.get(formId)!;

    // If the condition would not result in a state change, skip it
    const currentState = form.currentState;
    const nextState = form.states.get(currentState)![action];

    if (
      !nextState ||
      (typeof nextState === 'function' && nextState() === currentState) ||
      nextState === currentState
    ) {
      console.log("Same ol' same ol'. No state change needed.");
      return;
    }

    console.log(`Action reported: ${action}`);

    // Actual state change
    this.transitionTo(form, nextState);
  }

  addForm<T extends Record<string, FieldValue>>(
    formId: string,
    options: FormOptions<T>
  ) {
    const form = this.forms.get(formId);

    if (!form) {
      console.log('Registering form', formId);
      const states = options.stages
        ? this.getOptionsStates(formId, options.stages)
        : Formikro.getDefaultState();

      const stagesMap = options.stages
        ? new MMap(
            options.stages.map<[string, Stage]>((stage) => [
              stage,
              { isValid: false },
            ])
          )
        : new MMap<string, Stage>([['DEFAULT', { isValid: false }]]);

      this.forms.set(formId, {
        onSubmit: options.onSubmit as (
          data: Record<string, FieldValue>
        ) => Promise<unknown>,
        initialValues: new MMap(options.initialValues),
        currentState: options.stages
          ? `${options.stages[0].toUpperCase()}_INVALID`
          : 'DEFAULT_INVALID',
        states: states,
        stages: stagesMap,
        fields: new MMap(),
      });
    }

    console.log('Form', formId, 'already registered');
    console.log(this);
  }

  setFieldState(formId: string, fieldId: string, isValid: boolean): void {
    const field = this.forms.get(formId)?.fields.get(fieldId);

    if (field && field.isValid !== isValid) {
      console.log('FIELD', fieldId, 'IS VALID', isValid);
      field.isValid = isValid;
      this.notifyObservers([formId, fieldId]);
    }
  }

  getField(formId: string, fieldId: string): Field | undefined {
    return this.forms.get(formId)?.fields.get(fieldId);
  }

  addObserver(
    observerKey: string[],
    [observerId, observerCallback]: [string, (state: FormState) => void]
  ): void {
    console.log('🔥 ADD OBSERVER', observerKey, observerId);

    const observers = this.observers.get(observerKey);
    if (!observers) {
      this.observers.set(observerKey, new MMap<string, Observer>());
    }
    this.observers.get(observerKey)!.set(observerId, observerCallback);
  }

  removeObserver(observerKey: string[], observerId: string): void {
    console.log('REMOVE OBSERVER 🎃', observerKey, observerId);

    const observers = this.observers.get(observerKey);

    if (observers) {
      observers.delete(observerId);
      if (observers.size === 0) {
        this.observers.delete(observerKey);
      } else {
        this.observers.set(observerKey, observers);
      }
    }
  }

  private notifyObservers(observerKey: string[]) {
    const observers = this.observers.get(observerKey);
    const form = this.forms.get(observerKey[0]);

    if (form) {
      console.log('🥁 Notify observers:', observerKey);
      observers?.forEach((observer) => observer(form));
    }
  }

  public dispatch<ActionType extends keyof Actions>(
    path: string[],
    actionType: ActionType,
    payload: any
  ) {
    this.eventQueue.push({
      path,
      action: actions[actionType](payload),
    });
    this.processQueue();
  }

  private processQueue() {
    while (this.eventQueue.length > 0) {
      const { path, action } = this.eventQueue.shift() as Event;
      this.set(path, action);
    }
  }

  static getInstance(): Formikro {
    if (!Formikro.instance) {
      Formikro.instance = new Formikro();
    }
    return Formikro.instance;
  }

  static getDefaultState(): MMap<StateId, Transition> {
    return new MMap<StateId, Transition>({
      DEFAULT_INVALID: {
        isValid: 'DEFAULT_VALID',
        isInvalid: null,
        next: null,
        previous: null,
      },
      DEFAULT_VALID: {
        isValid: null,
        isInvalid: 'DEFAULT_INVALID',
        next: null,
        previous: null,
      },
    });
  }

  private getOptionsStates(
    formId: string,
    stages: string[]
  ): MMap<StateId, Transition> {
    const statesSet = new Set(stages);
    const statesMap = new MMap<StateId, Transition>();

    const prevIterator = statesSet.values();
    const nextIterator = statesSet.values();
    nextIterator.next(); // Kick-off the iterator to the next value

    let previousStage: string | null = null;

    for (const currentStage of prevIterator) {
      const nextStage: string = nextIterator.next().value; // Grab the next value

      statesMap.merge({
        [`${currentStage.toUpperCase()}_INVALID`]: {
          isValid: `${currentStage.toUpperCase()}_VALID`,
          isInvalid: null,
          previous: previousStage
            ? () => this.isValidStage(formId, previousStage!)
            : null,
          next: nextStage ? () => this.isValidStage(formId, nextStage) : null,
        },
        [`${currentStage.toUpperCase()}_VALID`]: {
          isValid: null,
          isInvalid: `${previousStage?.toUpperCase()}_INVALID`,
          previous: previousStage
            ? () => this.isValidStage(formId, previousStage!)
            : null,
          next: nextStage ? () => this.isValidStage(formId, nextStage) : null,
        },
      });

      previousStage = currentStage;
    }

    return statesMap;
  }

  private isValidStage(formId: string, stage: string): string {
    const form = this.forms.get(formId)!;

    const isStageValid = form.stages.get(stage)!.isValid;
    if (!isStageValid) {
      return `${stage.toUpperCase()}_INVALID`;
    } else {
      return `${stage.toUpperCase()}_VALID`;
    }
  }

  private set(path: string[], mutate: (state: FormState) => FormState) {
    const formId = path[0];
    const currentState = this.forms.get(formId);
    if (currentState) {
      const newState = mutate(currentState);
      this.forms.set(formId, newState);
      this.notifyObservers(path);
    }
  }
}

const instance = Formikro.getInstance();
export default instance;
