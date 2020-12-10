/* eslint-disable @typescript-eslint/no-explicit-any */
// to resolve this issue https://github.com/davidkpiano/xstate/issues/1198#issuecomment-632899035
import {
  Machine,
  MachineConfig,
  MachineOptions,
  DoneInvokeEvent,
  assign,
} from 'xstate';

import * as candlestickSockets from '../../services/sockets/candlestick';
import * as candlestickApis from '../../services/apis/candlestick';

export type DataElement = {
  time: number;
  openingPrice: number;
  highestPrice: number;
  lowestPrice: number;
  closingPrice: number;
};

export interface Context {
  socket?: WebSocket;
  data: Map<number, DataElement>;
}

export interface States {
  states: {
    initData: Record<string, unknown>;
    ready: Record<string, unknown>;
    errorData: Record<string, unknown>;
    errorSocket: Record<string, unknown>;
  };
}

export type MessageEvent = {
  type: 'MESSAGE';
  data: DataElement;
};
export type SocketErrorEvent = { type: 'SOCKET_ERROR' };
export type Events = MessageEvent | SocketErrorEvent;

const createDataElement = ([
  time,
  openingPrice,
  highestPrice,
  lowestPrice,
  closingPrice,
]: [number, string, string, string, string]): DataElement => ({
  time: +time,
  openingPrice: +openingPrice,
  highestPrice: +highestPrice,
  lowestPrice: +lowestPrice,
  closingPrice: +closingPrice,
});

export const defaultContext: Context = {
  data: new Map(),
};

export const config: MachineConfig<Context, States, Events> = {
  initial: 'initData',
  context: defaultContext,
  states: {
    initData: {
      invoke: {
        id: 'initCandlesticks',
        src: 'getCandlesticks',
        onDone: {
          target: 'ready',
          actions: ['setData'],
        },
        onError: 'errorData',
      },
    },
    ready: {
      invoke: {
        id: 'initWebscoket',
        src: 'initCandlestickStream',
      },
      on: {
        MESSAGE: {
          actions: ['pushData'],
        },
        SOCKET_ERROR: 'errorSocket',
      },
    },
    errorData: {
      after: {
        3000: 'initData',
      },
    },
    errorSocket: {
      after: {
        3000: 'initData',
      },
    },
  },
};

export const options: MachineOptions<Context, Events> = {
  actions: {
    setData: assign<
      Context,
      DoneInvokeEvent<candlestickApis.CandlestickResponse>
    >({
      data: (
        _: Context,
        event: DoneInvokeEvent<candlestickApis.CandlestickResponse>
      ) => {
        const arr = event.data.map((d): [number, DataElement] => {
          const [t, o, h, l, c] = d;
          return [t, createDataElement([t, o, h, l, c])];
        });
        return new Map(arr);
      },
    }) as any,
    pushData: assign<Context, MessageEvent>({
      data: (context: Context, event: MessageEvent) => {
        const d = event.data;
        context.data.set(d.time, d);
        return context.data;
      },
    }) as any,
    initSocket: assign<Context, DoneInvokeEvent<WebSocket>>({
      socket: (_: Context, event: DoneInvokeEvent<WebSocket>) => event.data,
    }) as any,
  },
  services: {
    getCandlesticks: (): Promise<candlestickApis.CandlestickResponse> =>
      candlestickApis.getCandlesticks(),
    initCandlestickStream: (context: Context, events: Events) => (
      cb,
      onReceive
    ) => {
      const socket = candlestickSockets.createCandlestickStream();
      socket.addEventListener('message', (e) => {
        const res = JSON.parse(e.data);
        const { t, o, h, l, c } = res.data.k;
        cb({ type: 'MESSAGE', data: createDataElement([t, o, h, l, c]) });
      });
      socket.addEventListener('error', (e) => {
        cb({ type: 'SOCKET_ERROR' });
      });
    },
  },
  activities: {},
  guards: {},
  delays: {},
};

export const machine = Machine(config, options);
