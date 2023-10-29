import { useState, useEffect, useCallback } from 'react';
import { Client } from '../core/Client';
import { StageState } from '../core/StateManager';

export function useStage(client: Client, stageId: string) {
  const stage = client.getStage(stageId);
  const uid = stage?.uid;
  const [isActive, setIsActive] = useState(stage?.isActive);
  const [isComplete, setIsComplete] = useState(
    stage?.currentState === StageState.COMPLETE
  );

  // set up an observer
  const stageObserver = useCallback(() => {
    setIsComplete(stage?.currentState === StageState.COMPLETE);
    setIsActive(stage?.isActive);
  }, [stage]);

  // subscribe to state change
  useEffect(() => {
    client.subscribe('SET_STAGE_STATE', stageObserver, uid!);
    client.subscribe('SET_ACTIVE_STAGE', stageObserver, uid!);

    return () => {
      client.unsubscribe('SET_STAGE_STATE', uid!);
      client.unsubscribe('SET_ACTIVE_STAGE', uid!);
    };
  }, [client, stage, stageObserver, uid]);

  return {
    isComplete,
    isActive,
  };
}
