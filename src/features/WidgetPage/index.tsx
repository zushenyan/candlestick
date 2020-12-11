import React from 'react';
import { useMachine } from '@xstate/react';

import Widget from '../../components/Widget';
import DropdownFilter from '../../components/Widget/DropdownFilter';
import { machine } from './machine';

const WidgetPage: React.FC<unknown> = () => {
  const [current, send] = useMachine(machine);
  const { data, options, filterValue } = current.context;

  const d = Array.from(data.values())
    .filter((v) => v.parentMarket === filterValue)
    .map((p) => ({
      name: `${p.base}/${p.parentMarket}`,
      latestPrice: p.latestPrice,
      parentMarket: p.parentMarket,
    }));

  // console.log(current.value);
  console.log(current.value);

  return (
    <>
      <button
        onClick={() => {
          if (current.matches('ready.connected')) {
            send({ type: 'DISCONNECT' });
          } else if (current.matches('ready.disconnected')) {
            send({ type: 'RECONNECT' });
          }
        }}
        disabled={
          current.matches('init') ||
          current.matches('ready.connecting') ||
          current.matches('ready.error')
        }
      >
        {current.matches('init')
          ? 'loading...'
          : current.matches('ready.connecting')
          ? 'connecting...'
          : current.matches('ready.connected')
          ? 'disconnect'
          : current.matches('ready.disconnected')
          ? 'reconnect'
          : 'error. Retrying in 3 seconds.'}
      </button>
      <DropdownFilter
        onChange={(e) =>
          send({ type: 'SET_FILTER_VALUE', value: e.target.value })
        }
        options={options}
        value={filterValue}
      />
      <Widget
        columns={[
          {
            Header: 'Name',
            accessor: 'name',
          },
          {
            Header: 'Latest Price',
            accessor: 'latestPrice',
          },
        ]}
        data={d}
      />
    </>
  );
};

export default WidgetPage;
