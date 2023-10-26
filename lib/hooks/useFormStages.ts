import { useCallback, useState, useRef, useEffect } from 'react';
import Form from '../core/Form';

export function useFormStages(Form: Form) {
  const uid = useRef(Math.random().toString(36).substring(2, 8));
  const Client = Form.getClient();
  const [stages, setStages] = useState(Client.getStages());

  const formObserver = useCallback(() => {
    const stages = Client.getStages();

    setStages(stages);
  }, [Client]);

  useEffect(() => {
    const observerId = uid.current;
    const action = 'SET_ACTIVE_STAGE';

    Form.subscribe(action, formObserver, observerId);

    return () => Form?.unsubscribe(action, observerId);
  }, [Form, formObserver]);

  return stages;
}
