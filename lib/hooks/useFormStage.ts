import { useCallback, useState, useRef, useEffect } from 'react';
import { Client } from '../core/Client';
import { StageState } from '../core/StateManager';

export function useFormStage(client: Client) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const [index, setIndex] = useState(client.activeStageIndex);
  const [isComplete, setIsComplete] = useState(
    client.activeStageState === StageState.COMPLETE
  );

  const formObserver = useCallback(() => {
    setIsComplete(client.activeStageState === StageState.COMPLETE);
    setIndex(client.activeStageIndex);
  }, [client]);

  useEffect(() => {
    const observerId = uid.current;

    client.subscribe('SET_STAGE_STATE', formObserver, observerId);
    client.subscribe('SET_ACTIVE_STAGE', formObserver, observerId);

    return () => {
      client.unsubscribe('SET_STAGE_STATE', observerId);
      client.unsubscribe('SET_ACTIVE_STAGE', observerId);
    };
  }, [client, formObserver]);

  return {
    canGoToPrevious: index! > 0,
    canGoToNext: isComplete && index! < client.totalStages! - 1,
  };
}
