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
  const barClient = useFormikroClient('bar-form');

  const BarForm = useFormikro('bar-form', {
    onSubmit: saveBar,
    fields: {
      trousers: { isRequired: true, initialValue: 'bar' },
      maker: { isRequired: false, initialValue: 'Joes' },
      dimensions: { isRequired: true, initialValue: 56 },
      shade: { isRequired: false },
    },
  });

  return (
    <div>
      <h1>Playground</h1>
      <div style={{ marginBottom: 20 }}>
        <button onClick={barClient.submit}>Submit</button>
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
