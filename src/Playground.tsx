import { useFormikro, useFormikroClient } from '../lib/main';
import { Input } from './components/Input';

type BarForm = {
  trousers: string;
  maker: string;
  dimensions: number;
  shade: 'red' | 'blue' | 'pink';
};

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

export function Playground() {
  const { submit: submitBar, canSubmit } = useFormikroClient('bar-form');

  const BarForm = useFormikro('bar-form', {
    onSubmit: saveBar,
    fields: {
      trousers: {
        isRequired: true,
        initialValue: 'bar',
        validators: [(fields) => validateTrousers(fields.trousers)],
      },
      maker: { isRequired: false, initialValue: 'Joes' },
      dimensions: { isRequired: true, initialValue: 56 },
      shade: { isRequired: true },
    },
  });

  return (
    <div>
      <h1>Playground</h1>
      <div style={{ marginBottom: 20 }}>
        <button onClick={submitBar} disabled={!canSubmit}>
          Submit
        </button>
      </div>
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
          id='shade'
          render={(props) => <Input {...props} label='Shade' />}
        />
      </BarForm>
    </div>
  );
}

function validateTrousers(value: string) {
  console.log('Validating trousers');
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
