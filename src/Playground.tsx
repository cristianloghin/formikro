import { useEffect, useState } from 'react';
import { useFormikro } from '../lib/main';

type FooForm = {
  pants: string;
  brand: string;
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
  const [colorOptions, setColorOptions] = useState<[string, string][]>([]);

  useEffect(() => {
    async function fetchColors() {
      const colors = await delayedOptions();
      setColorOptions(colors);
    }

    fetchColors();
  }, []);

  const { ComposedForm: FooForm, isSubmittable: fooSubmittable } = useFormikro<
    FooForm,
    StagesFoo
  >('FooForm', {
    onSubmit: saveFoo,
    multiStage: true,
    data: {
      FOO: {
        pants: {
          isRequired: true,
        },
        brand: {
          isRequired: false,
        },
      },
      BANG: {
        size: {
          isRequired: true,
        },
      },
      BAR: {
        color: {
          isRequired: true,
          sideEffects: {
            clear: ['brand', 'pants'],
          },
        },
      },
    },
  });

  const { ComposedForm: BarForm, isSubmittable: barSubmittable } =
    useFormikro<BarForm>('BarForm', {
      onSubmit: saveBar,
      data: {
        trousers: {
          isRequired: true,
          initialValue: 'Pantaloons',
        },
        maker: {
          isRequired: false,
          initialValue: 'Joes',
        },
        dimensions: {
          isRequired: true,
          initialValue: 30,
        },
        shade: {
          isRequired: false,
          initialValue: 'red',
        },
      },
    });

  return (
    <>
      <h1>Playground</h1>
      <div
        style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 2fr' }}
      >
        <div>
          <div
            style={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '.66rem',
            }}
          >
            <button disabled>Reset</button>
            <button disabled={!barSubmittable}>Submit</button>
          </div>
          <BarForm>
            <BarForm.Input id='trousers' label='Trousers' />
            <BarForm.Input id='maker' label='Maker' />
            <BarForm.Input id='dimensions' label='Dimensions' />
            <BarForm.Input id='shade' label='Shade' />
          </BarForm>
        </div>
        <div>
          <div
            style={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '.66rem',
            }}
          >
            <button disabled>Reset</button>
            <button disabled>Previous</button>
            <button disabled>Next</button>
            <button disabled={!fooSubmittable}>Submit</button>
          </div>
          <FooForm>
            <FooForm.Stage name='FOO'>
              <FooForm.Input id='pants' label='Pants' />
              <FooForm.Input id='brand' label='Brand' />
            </FooForm.Stage>
            <FooForm.Stage name='BANG'>
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
