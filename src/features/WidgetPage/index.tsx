import React from 'react';
import { useMachine } from '@xstate/react';

import { machine } from './machine';

const WidgetPage: React.FC<unknown> = () => {
  const [current, send] = useMachine(machine);

  console.log(current);

  return <h1>widget</h1>;
};

export default WidgetPage;
