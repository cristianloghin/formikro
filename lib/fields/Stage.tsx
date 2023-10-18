import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useCallback,
  cloneElement,
} from 'react';
import Form, { Observer } from '../core/Form';
import { Actions } from '../core/actions';
import { FieldProps } from '../core/useFormikro';

export interface StageProps {
  name: string;
  children: React.ReactNode;
}

export function Stage<T>(
  dispatch: (path: string[], action: keyof Actions, payload: unknown) => void,
  formId: string,
  props: StageProps
) {
  const { name, children } = props;
  useStage(dispatch, formId, props);
  useStageObserver(formId, name);

  return (
    <fieldset form={formId} name={name} style={{ marginTop: 20 }}>
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            stageId: name,
          } as FieldProps<T>);
        }
        return child;
      })}
    </fieldset>
  );
}

function useStage(
  dispatch: (path: string[], action: keyof Actions, payload: unknown) => void,
  formId: string,
  props: StageProps
) {
  const { name, children } = props;

  useEffect(() => {
    const fields = new Set<[string, boolean]>();
    if (children) {
      Children.forEach(children, (field) => {
        if (isValidElement(field)) {
          fields.add([field.props.id, !field.props.required]);
        }
      });
      dispatch([formId, name], 'registerStageFields', {
        formId,
        stageId: name,
        fields,
      });
    }
  }, [dispatch, formId, name, children]);
}

function useStageObserver(formId: string, stageId: string) {
  const observerId = useRef(Math.random().toString(36).substring(2, 8));
  const stageObserver = useCallback<Observer>(
    (state) => {
      console.log('Stage observer id', formId, state);
    },
    [formId]
  );

  useEffect(() => {
    const id = observerId.current;
    Form.addObserver([formId, stageId], [id, stageObserver]);

    return () => Form.removeObserver([formId, stageId], id);
  }, [formId, stageId, stageObserver]);
}
