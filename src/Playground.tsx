import { useEffect, useState } from 'react';
import { useFormikro, useFormikroClient } from '../lib/main';
import { Input } from './components/Input';
import { Select } from './components/Select';

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
  shade: 'red' | 'blue' | 'pink';
};

function delayedOptions() {
  return new Promise<[string, string][]>((resolve) => {
    setTimeout(
      () =>
        resolve([
          ['Red Color', 'red'],
          ['Blue Color', 'blue'],
          ['Pink color', 'pink'],
        ]),
      1000
    );
  });
}

function saveFoo(data: FooForm) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('Saved Foo!!!', data);
      resolve();
    }, 2000);
  });
}

function saveBar(data: BarForm) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (data.shade === 'red') {
        console.log('Saved BARRRR!!!', data);
        resolve();
      } else {
        reject('Something went wrong');
      }
    }, 2000);
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
        sideEffects: { clear: ['size'] },
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
        isRequired: true,
        validators: [(data) => validateShade(data.maker, data.shade)],
      },
    },
  });

  const {
    state: barState,
    // fields: barFields,
    controller: barController,
  } = useFormikroClient<BarForm>('BarForm');
  const { state: fooState, controller: fooController } =
    useFormikroClient('FooForm');

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
          <p>
            {barState.isSubmitting && 'SUBMITTING'}
            {barState.success && 'SUCCESS'}
            {barState.error && 'ERROR'}
          </p>
          <BarForm>
            <BarForm.Field
              id='trousers'
              render={(props) => <Input {...props} label='Trousers' />}
            />
            <BarForm.Field
              id='maker'
              render={(props) => <Input {...props} label='Maker' />}
            />
            <BarForm.Field
              id='dimensions'
              render={(props) => <Input {...props} label='Dimensions' />}
            />
            <BarForm.Field
              id='shade'
              render={(props) => (
                <Select {...props} label='Shade' options={colorOptions} />
              )}
            />
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
            <button
              disabled={!barState.isSubmittable}
              onClick={() =>
                barController
                  .submit()
                  .then(() => console.log('YEEEEEE'))
                  .catch((error) => console.log(error))
              }
            >
              Submit
            </button>
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
              disabled={!fooState.stage.canGoToPrevious}
            >
              Previous
            </button>
            <button
              onClick={fooController.nextStage}
              disabled={!fooState.stage.canGoToNext}
            >
              Next
            </button>
            <button
              onClick={fooController.submit}
              disabled={!fooState.isSubmittable}
            >
              {fooState.isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          <FooForm>
            <FooForm.Stage name='FOO'>
              <FooForm.Field
                id='pants'
                render={(props) => <Input {...props} label='Pants' />}
              />
              <FooForm.Field
                id='brand'
                render={(props) => <Input {...props} label='Brand' />}
              />
            </FooForm.Stage>
            <FooForm.Stage name='BANG'>
              <FooForm.Field
                id='type'
                render={(props) => (
                  <Select {...props} label='Type' options={typeOptions} />
                )}
              />
              <FooForm.Field
                id='size'
                render={(props) => <Input {...props} label='Size' />}
              />
            </FooForm.Stage>
            <FooForm.Stage name='BAR'>
              <FooForm.Field
                id='color'
                render={(props) => (
                  <Select {...props} label='Color' options={colorOptions} />
                )}
              />
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
