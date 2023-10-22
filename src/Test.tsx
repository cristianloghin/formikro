/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react';

type SubmitFields = {
  foo: string;
  bar: number;
  fiz: boolean;
};

type Stages = 'FOO_STAGE' | 'BAR_STAGE';

export function Test() {
  const { Field, Stage } = useTest<SubmitFields, Stages>('name', {
    onSubmit: () => {},
    data: {
      FOO_STAGE: {
        foo: {
          initialValue: 'bar',
          required: true,
          validate: (value) => !!value,
        },
        bar: {
          required: false,
          initialValue: 453,
          disable: (data) => !data.foo,
          validate: (value) => value === 10,
        },
      },
      BAR_STAGE: {
        fiz: {
          initialValue: true,
          required: true,
          sideEffects: { clear: ['foo'] },
        },
      },
    },
  });

  const { Field: Field2 } = useTest<SubmitFields>('otherName', {
    onSubmit: () => {},
    data: {
      foo: {
        initialValue: 'pants',
        required: true,
      },
    },
  });

  return (
    <>
      <Stage id='FOO_STAGE'>
        <Field id='bar' />
      </Stage>
      <Stage id='BAR_STAGE'>
        <Field id='foo' />
        <Field id='fiz' />
      </Stage>
      <Field2 id='foo' />
    </>
  );
}

type FormOptions<T, K extends string> = K extends 'DEFAULT'
  ? {
      onSubmit: () => void;
      data: SmartFields<T>;
    }
  : {
      onSubmit: () => void;
      multiStage?: true;
      data: Record<K, SmartFields<T>>;
    };

type StageProps<K> = {
  id: K;
  children: React.ReactNode;
};

type FieldProps<T> = {
  id: Extract<keyof T, string>;
};

function useTest<T extends Record<string, any>, K extends string = 'DEFAULT'>(
  name: string,
  options: FormOptions<T, K>
) {
  useEffect(() => {
    if (options.multiStage) {
      const stages = Object.keys(options.data).join(', ');
      console.log('Use stages:', stages, 'for:', name);
    } else {
      console.log('Use stage: DEFAULT for:', name);
    }
  }, [name, options]);

  const Field = (props: FieldProps<T>) => <div id={props.id}>{props.id}</div>;
  const Stage = (props: StageProps<K>) => <div>{props.children}</div>;

  return { Field, Stage };
}

type SmartFields<T> = {
  [name in keyof Partial<T>]: {
    required: boolean;
    initialValue?: T[name];
    disable?: (data: T) => boolean;
    validate?: (value: T[name]) => boolean;
    sideEffects?: FieldSideEffects<Exclude<keyof T, name>>;
  };
};

type FieldSideEffects<T> = {
  disable?: T[];
  clear?: T[];
  validate?: T[];
};
