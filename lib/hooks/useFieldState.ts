import { useState, useEffect, useCallback } from 'react';
import { Client } from '../core/Client';

export function useFieldState(client: Client, id: string) {
  const field = client.getField(id);
  const uid = field?.uid;

  const [currentState, setCurrentState] = useState(field?.currentState);
  const [error, setError] = useState('');

  // set up an observer
  const fieldObserver = useCallback(() => {
    setCurrentState((state) => {
      if (state === field?.currentState) {
        return state;
      }
      return field?.currentState;
    });

    setError((error) => {
      if (error === field?.error) {
        return error;
      }
      return field?.error || '';
    });
  }, [field]);

  // subscribe to value change
  useEffect(() => {
    client.subscribe('SET_FIELD_STATE', fieldObserver, uid!);

    return () => client.unsubscribe('SET_FIELD_STATE', uid!);
  }, [client, field, fieldObserver, uid]);

  return { currentState, error };
}
