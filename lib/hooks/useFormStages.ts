import { useCallback, useState, useRef, useEffect } from 'react';
import { Client } from '../core/Client';

export function useFormStages(client: Client) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const [stages, setStages] = useState(client.getStages());

  const formObserver = useCallback(() => {
    const stages = client.getStages();

    setStages(stages);
  }, [client]);

  useEffect(() => {
    const observerId = uid.current;
    const action = 'SET_ACTIVE_STAGE';

    client.subscribe(action, formObserver, observerId);

    return () => client.unsubscribe(action, observerId);
  }, [client, formObserver]);

  return stages;
}
