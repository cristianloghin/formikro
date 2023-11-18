import { useFormikro, useFormikroClient } from '../lib/main';
import { Input } from './components/Input';

type BarForm = {
  trousers: string;
  maker: string;
  dimensions: number;
  shade: 'red' | 'blue' | 'pink';
};

function saveBar(data: BarForm) {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (data.shade === 'red') {
        resolve('Pants, pants, pants!!!');
      } else {
        reject('Your pants **must** be red!');
      }
    }, 2000);
  });
}

export function Playground() {
  const { submit: submitBar, canSubmit } =
    useFormikroClient<BarForm>('bar-form');

  const BarForm = useFormikro('bar-form', {
    submit: {
      submitFn: saveBar,
      onSuccess: (res) => console.log('😅🔥', res),
      onError: (err) => console.error(err, '🌩😱'),
    },
    fields: {
      trousers: {
        isRequired: true,
        initialValue: 'bar',
        validators: [
          (value, fields) => validateTrousers(value, fields.maker.value),
        ],
        sideEffects: [
          (value, { dimensions }) => {
            if (value === 'porks') {
              dimensions.value = 67;
            }
          },
        ],
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
          id='dimensions'
          render={(props) => <Input {...props} label='Dimensions' />}
        />
        <BarForm.Field
          id='shade'
          render={(props) => <Input {...props} label='Shade' />}
        />
      </BarForm>
    </div>
  );
}

function validateTrousers(value: string, maker?: string) {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (!value) {
        reject('No value man.');
      } else if (value === 'pants') {
        reject(`No pants from ${maker} please.`);
      } else if (value.length < 3) {
        reject('Longer pants please.');
      } else {
        resolve('');
      }
    }, 1500);
  });
}
