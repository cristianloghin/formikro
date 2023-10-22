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
  size: number;
  color: 'red' | 'blue';
};

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
  const canSubmitBar = false;
  const canSubmitFoo = false;

  const FooForm = useFormikro<FooForm, StagesFoo>('fooBarForm', {
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
        },
      },
    },
  });

  const BarForm = useFormikro<BarForm>('barBarFoo', {
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
      size: {
        isRequired: true,
        initialValue: 30,
      },
      color: {
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
              gridAutoFlow: 'column',
              gap: '.66rem',
            }}
          >
            <button disabled>Reset</button>
            <button disabled={!canSubmitBar}>Submit</button>
          </div>
          <BarForm>
            <BarForm.Input id='trousers' label='Trousers' />
            <BarForm.Input id='maker' label='Maker' />
            <BarForm.Input id='size' label='Size' />
            <BarForm.Input id='color' label='Color' />
          </BarForm>
        </div>
        <div>
          <div
            style={{
              display: 'grid',
              width: '100%',
              gridAutoFlow: 'column',
              gap: '.66rem',
            }}
          >
            <button disabled>Reset</button>
            <button disabled>Previous</button>
            <button disabled>Next</button>
            <button disabled={!canSubmitFoo}>Submit</button>
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
              <FooForm.Input id='color' label='Color' />
            </FooForm.Stage>
          </FooForm>
        </div>
      </div>
    </>
  );
}
