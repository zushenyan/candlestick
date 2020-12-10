import React from 'react';
import { useMachine } from '@xstate/react';

import CandlestickChart from '../../components/CandlestickChart';
import { machine } from './machine';

const CandlestickChartPage: React.FC<unknown> = () => {
  const [current] = useMachine(machine);
  const { data } = current.context;

  // get the most recent 80 records
  const buckets = Array.from(data.values()).slice(420);

  return (
    <>
      {current.matches('initData') ? (
        'fetching data...'
      ) : current.matches('errorData') ? (
        'data fetching error. Will try again in 3 seconds...'
      ) : current.matches('errorSocket') ? (
        'streamming error. Will try again in 3 seconds...'
      ) : (
        <CandlestickChart width={1000} height={500} buckets={buckets} />
      )}
    </>
  );
};

export default CandlestickChartPage;
