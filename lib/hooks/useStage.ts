import { useRef, useState, useEffect, useCallback } from 'react';
import { Client } from '../core/Client';
import { FormObserver } from '../core/types';
import { StageState } from '../core/__StateManager';

export function useStage(clientInstance: Client, stageId: string) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const Stage = clientInstance.getStage(stageId);
  const [isActive, setIsActive] = useState(Stage?.isActive);
  const [isComplete, setIsComplete] = useState(
    Stage?.currentState === StageState.COMPLETE
  );

  // set up an observer
  const stageObserver = useCallback<FormObserver>(() => {
    setIsComplete(Stage?.currentState === StageState.COMPLETE);
    setIsActive(Stage?.isActive);
  }, [Stage]);

  // subscribe to state change
  useEffect(() => {
    const observerId = uid.current;
    const action = `SET_STAGE_STATE:${Stage?.id}`;
    clientInstance.subscribe(action, stageObserver, observerId);

    return () => clientInstance.unsubscribe(action, observerId);
  }, [clientInstance, Stage, stageObserver]);

  return {
    isComplete,
    isActive,
    formId: Stage?.formId,
  };
}
