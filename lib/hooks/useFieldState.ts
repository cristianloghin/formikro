import { useState, useEffect, useCallback } from 'react';
import { Client } from '../core/Client';

export function useFieldState(client: Client, id: string) {
  const field = client.getField(id);
  const uid = field?.uid;

  const [currentState, setCurrentState] = useState(field?.currentState);
  const [error, setError] = useState('');

  // set up an observer
  const fieldObserver = useCallback(() => {
    if (field) {
      setCurrentState(field.currentState);
      setError(field.error);
    }
  }, [field]);

  // subscribe to value change
  useEffect(() => {
    const action = `SET_FIELD_STATE`;
    client.subscribe(action, fieldObserver, uid!);

    return () => client.unsubscribe(action, uid!);
  }, [client, field, fieldObserver, uid]);

  return { currentState, error };
}
