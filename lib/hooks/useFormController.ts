import { useCallback } from 'react';
import Client from '../core/__Client';

export function useFormController(Client: Client) {
  const submit = useCallback(() => {
    console.log('Submit', Client.getFormId());
  }, [Client]);

  const nextStage = useCallback(() => {
    Client.goToNextStage();
  }, [Client]);

  const previousStage = useCallback(() => {
    () => console.log('Go to previous stage', Client.getFormId());
    Client.goToPreviousStage();
  }, [Client]);

  return {
    submit,
    nextStage,
    previousStage,
  };
}
