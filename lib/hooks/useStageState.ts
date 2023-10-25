import { useRef, useState, useEffect, useCallback } from 'react';
import Form from '../core/Form';
import { FormObserver } from '../core/types';
import { StageState } from '../core/StateManager';

export function useStageState(Form: Form, stageId: string) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const Stage = Form.getStage(stageId);
  const [state, setState] = useState<StageState>(Stage.currentState);

  // set up an observer
  const stageObserver = useCallback<FormObserver>(() => {
    setState(Stage.currentState);
  }, [Stage]);

  // subscribe to value change
  useEffect(() => {
    const observerId = uid.current;
    const action = `SET_STAGE_STATE:${Stage.id}`;
    Form.subscribe(action, stageObserver, observerId);

    return () => Form?.unsubscribe(action, observerId);
  }, [Form, Stage, stageObserver]);

  return state;
}
