import { useEffect, useState } from 'react';
import { useFormikro, useFormikroClient } from '../lib/main';

enum TYPES {
  'cargo',
  'capri',
  'jeans',
  'tracksuit',
  'culottes',
  'bell-bottoms',
  'chinos',
  'dress',
}

type FooForm = {
  pants: string;
  brand: string;
  type: keyof typeof TYPES;
  size: number;
  color: 'red' | 'blue';
};

type BarForm = {
  trousers: string;
  maker: string;
  dimensions: number;
  shade: 'red' | 'blue';
};

function delayedOptions() {
  return new Promise<[string, string][]>((resolve) => {
    setTimeout(
      () =>
        resolve([
          ['Red Color', 'RED_VALUE'],
          ['Blue Color', 'BLUE_VALUE'],
        ]),
      1000
    );
  });
}

function saveFoo(data: FooForm) {
  return new Promise<void>((resolve) => {
    console.log('Saved Foo!!!', data);
    resolve();
  });
}

function saveBar(data: BarForm) {
  return new Promise<void>((resolve) => {
    console.log('Saved Foo!!!', data);
    resolve();
  });
}

type StagesFoo = 'FOO' | 'BANG' | 'BAR';

export function Playground() {
  const typeOptions: [string, string][] = Object.values(TYPES)
    .filter((type) => typeof type === 'string')
    .map((type) => [type.toString(), type.toString()]);

  const [colorOptions, setColorOptions] = useState<[string, string][]>([]);

  useEffect(() => {
    async function fetchColors() {
      const colors = await delayedOptions();
      setColorOptions(colors);
    }

    fetchColors();
  }, []);

  const FooForm = useFormikro<FooForm, StagesFoo>('FooForm', {
    onSubmit: saveFoo,
    stages: ['FOO', 'BANG', 'BAR'],
    fields: {
      pants: {
        isRequired: true,
        validators: [(data) => validatePants(data.pants)],
        stage: 'FOO',
      },
      brand: {
        isRequired: false,
        validators: [(data) => validatePants(data.brand)],
        stage: 'FOO',
      },
      type: {
        isRequired: true,
        initialValue: 'chinos',
        stage: 'BANG',
      },
      size: {
        isRequired: true,
        stage: 'BANG',
        disable: (data) => !data.type,
      },
      color: {
        isRequired: true,
        stage: 'BAR',
      },
    },
  });

  const BarForm = useFormikro<BarForm>('BarForm', {
    onSubmit: saveBar,
    fields: {
      trousers: {
        isRequired: true,
        initialValue: 'Pantaloons',
      },
      maker: {
        isRequired: false,
        initialValue: 'Joes',
        sideEffects: {
          clear: ['dimensions'],
          validate: ['shade'],
        },
      },
      dimensions: {
        isRequired: true,
        initialValue: 30,
      },
      shade: {
        isRequired: false,
        initialValue: 'red',
        validators: [(data) => validateShade(data.maker, data.shade)],
      },
    },
  });

  const {
    isSubmittable: barSubmittable,
    // controller: barController,
  } = useFormikroClient('BarForm');
  const {
    isSubmittable: fooSubmittable,
    stage,
    controller: fooController,
  } = useFormikroClient('FooForm');

  return (
    <>
      <h1>Playground</h1>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr 2fr',
          width: 800,
        }}
      >
        <div>
          <h2>Bar Form</h2>
          <BarForm>
            <BarForm.Input id='trousers' label='Trousers' />
            <BarForm.Input id='maker' label='Maker' />
            <BarForm.Input id='dimensions' label='Dimensions' />
            <BarForm.Input id='shade' label='Shade' />
          </BarForm>
          <div
            style={{
              display: 'grid',
              width: '100%',
              marginTop: '1rem',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '.66rem',
            }}
          >
            <button disabled>Reset</button>
            <button disabled={!barSubmittable}>Submit</button>
          </div>
        </div>
        <div>
          <h2>Foo Form</h2>
          <div
            style={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '.66rem',
            }}
          >
            <button disabled>Reset</button>
            <button
              onClick={fooController.previousStage}
              disabled={!stage.canGoToPrevious}
            >
              Previous
            </button>
            <button
              onClick={fooController.nextStage}
              disabled={!stage.canGoToNext}
            >
              Next
            </button>
            <button
              // onClick={fooController.submit}
              disabled={!fooSubmittable}
            >
              Submit
            </button>
          </div>
          <FooForm>
            <FooForm.Stage name='FOO'>
              <FooForm.Input id='pants' label='Pants' />
              <FooForm.Input id='brand' label='Brand' />
            </FooForm.Stage>
            <FooForm.Stage name='BANG'>
              <FooForm.Select id='type' label='Type' options={typeOptions} />
              <FooForm.Input id='size' label='Size' />
            </FooForm.Stage>
            <FooForm.Stage name='BAR'>
              <FooForm.Select id='color' label='Color' options={colorOptions} />
            </FooForm.Stage>
          </FooForm>
        </div>
      </div>
    </>
  );
}

function validatePants(value: string) {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (value === 'pants') {
        reject('No pants please.');
      } else if (value.length < 3) {
        reject('Longer pants please.');
      } else {
        resolve('');
      }
    }, 1500);
  });
}

function validateShade(maker: string, shade: string) {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (shade === 'pink' && maker === 'Joez') {
        reject('Joez does not make pink pants.');
      } else {
        resolve('');
      }
    }, 1500);
  });
}
