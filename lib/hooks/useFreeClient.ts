import Global from '../core/Global';

function useFreeClient(formName: string) {
  const newClient = Global.getClient(formName);
  return newClient.fields;
}

export { useFreeClient };
