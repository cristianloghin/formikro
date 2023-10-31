import { useCallback } from 'react';
import { Client } from '../core/Client';

export function useFormController(client: Client) {
  const submit = useCallback(() => {
    console.log('Submit', client.formId);
  }, [client]);

  const nextStage = useCallback(() => {
    client.goToStage('next');
  }, [client]);

  const previousStage = useCallback(() => {
    client.goToStage('previous');
  }, [client]);

  return {
    submit,
    nextStage,
    previousStage,
  };
}
