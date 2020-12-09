/* eslint-disable @typescript-eslint/no-explicit-any */
// to resolve this issue https://github.com/davidkpiano/xstate/issues/1198#issuecomment-632899035
import {
  Machine,
  MachineConfig,
  MachineOptions,
  DoneInvokeEvent,
  assign,
} from 'xstate';

import * as klineApis from '../../services/apis/kilne';

export interface Context {
  initialData?: unknown;
}

export interface States {
  states: {
    init: Record<string, unknown>;
    ready: Record<string, unknown>;
    error: Record<string, unknown>;
  };
}

export type SetInitDataEvent = {
  type: 'SET_INIT_DATA';
  data: klineApis.KlinesResponse;
};
export type Events = SetInitDataEvent;

export const config: MachineConfig<Context, States, Events> = {
  initial: 'init',
  states: {
    init: {
      invoke: {
        id: 'initRest',
        src: 'getKlines',
        onDone: {
          target: 'ready',
          actions: ['setInitData'],
        },
        onError: 'error',
      },
    },
    ready: {},
    error: {},
  },
};

export const options: MachineOptions<Context, Events> = {
  actions: {
    setInitData: assign<Context, DoneInvokeEvent<klineApis.KlinesResponse>>({
      initialData: (
        _: Context,
        event: DoneInvokeEvent<klineApis.KlinesResponse>
      ) => event.data,
    }) as any,
  },
  services: {
    getKlines: (): Promise<klineApis.KlinesResponse> => klineApis.getKlines(),
  },
  activities: {},
  guards: {},
  delays: {},
};

export const machine = Machine(config, options);
