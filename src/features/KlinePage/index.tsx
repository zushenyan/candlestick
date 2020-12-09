import React from 'react';
import { useMachine } from '@xstate/react';

import { machine } from './machine';

const KlinePage: React.FC<unknown> = () => {
  const [current, send] = useMachine(machine);

  console.log(current);

  return <h1>kline</h1>;
};

export default KlinePage;
