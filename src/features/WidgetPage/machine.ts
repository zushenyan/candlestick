/* eslint-disable @typescript-eslint/no-explicit-any */
// to resolve this issue https://github.com/davidkpiano/xstate/issues/1198#issuecomment-632899035
import {
  Machine,
  MachineOptions,
  MachineConfig,
  DoneInvokeEvent,
  assign,
  send,
} from 'xstate';

import * as productsSockets from '../../services/sockets/products';
import * as productsApis from '../../services/apis/products';

export interface DataElement {
  symbol: string;
  base: string;
  quote: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  latestPrice: number;
  parentMarket: string;
  category: string;
}

const createDataElement = ({
  s,
  b,
  q,
  o,
  h,
  l,
  c,
  pm,
  pn,
}: productsApis.DataElement): DataElement => ({
  symbol: s,
  base: b,
  quote: q,
  openPrice: o,
  highPrice: h,
  lowPrice: l,
  latestPrice: c,
  parentMarket: pm,
  category: pn,
});

export interface Context {
  filterValue: string;
  options: string[];
  data: Map<string, DataElement>;
}

export interface States {
  states: {
    init: Record<string, unknown>;
    ready: {
      states: {
        connecting: Record<string, unknown>;
        connected: Record<string, unknown>;
        disconnected: Record<string, unknown>;
        error: Record<string, unknown>;
      };
    };
    errorData: Record<string, unknown>;
  };
}

export type MessageEvent = {
  type: 'MESSAGE';
  data: DataElement[];
};
export type SetFilterValueEvent = { type: 'SET_FILTER_VALUE'; value: string };
export type SocketErrorEvent = { type: 'SOCKET_ERROR' };
export type SocketConnectedEvent = { type: 'CONNECTED' };
export type SocketReconnectEvent = { type: 'RECONNECT' };
export type SocketDisonnectEvent = { type: 'DISCONNECT' };
export type Events =
  | MessageEvent
  | SocketErrorEvent
  | SetFilterValueEvent
  | SocketConnectedEvent
  | SocketReconnectEvent
  | SocketDisonnectEvent;

const defaultContext: Context = {
  filterValue: '',
  options: [],
  data: new Map(),
};

export const config: MachineConfig<Context, States, Events> = {
  initial: 'init',
  context: defaultContext,
  states: {
    init: {
      invoke: {
        id: 'getData',
        src: 'getData',
        onDone: {
          target: 'ready',
          actions: ['setData', 'initOptions', 'initFilterValue'],
        },
        onError: 'errorData',
      },
    },
    ready: {
      invoke: {
        id: 'productSocket',
        src: 'initProductsStream',
      },
      on: {
        SET_FILTER_VALUE: {
          actions: ['setFilterValue'],
        },
        SOCKET_ERROR: '.error',
      },
      initial: 'connecting',
      states: {
        connecting: {
          on: {
            CONNECTED: 'connected',
          },
        },
        connected: {
          on: {
            DISCONNECT: {
              target: 'disconnected',
              actions: [send('DISCONNECT', { to: 'productSocket' })],
            },
            MESSAGE: {
              actions: ['setStreamData'],
            },
          },
        },
        disconnected: {
          on: {
            RECONNECT: {
              target: 'connecting',
              actions: [send('RECONNECT', { to: 'productSocket' })],
            },
          },
        },
        error: {
          after: {
            3000: {
              target: 'connecting',
              actions: [send('RECONNECT', { to: 'productSocket' })],
            },
          },
        },
      },
    },
    errorData: {
      after: {
        3000: 'init',
      },
    },
  },
};

export const options: MachineOptions<Context, Events> = {
  actions: {
    setData: assign<Context, DoneInvokeEvent<productsApis.ProductsRepsonse>>({
      data: (
        _: Context,
        event: DoneInvokeEvent<productsApis.ProductsRepsonse>
      ) => {
        const arr = event.data.data.map((d): [string, DataElement] => [
          d.s,
          createDataElement(d),
        ]);
        return new Map(arr);
      },
    }) as any,
    initOptions: assign<Context>({
      options: (context: Context) => {
        const oSet = new Set<string>();
        context.data.forEach((v) => {
          oSet.add(v.parentMarket);
        });
        return Array.from(oSet.values());
      },
    }) as any,
    initFilterValue: assign<Context>({
      filterValue: (context: Context) => context.options[0],
    }) as any,
    setFilterValue: assign<Context, SetFilterValueEvent>({
      filterValue: (_: Context, event: SetFilterValueEvent) => event.value,
    }) as any,
    setStreamData: assign<Context, MessageEvent>({
      data: (context: Context, event: MessageEvent) => {
        event.data.forEach((d) => {
          const old = context.data.get(d.symbol);
          const data = createDataElement({
            s: d.symbol,
            b: old?.base || '',
            q: d.quote,
            o: d.openPrice,
            h: d.highPrice,
            l: d.lowPrice,
            c: d.latestPrice,
            pm: old?.parentMarket || '',
            pn: old?.category || '',
          });
          context.data.set(d.symbol, data);
        });
        return context.data;
      },
    }) as any,
  },
  services: {
    getData: (): Promise<productsApis.ProductsRepsonse> =>
      productsApis.getProducts(),
    initProductsStream: () => (cb, onReceive) => {
      let socket = productsSockets.createProductsStream();

      const init = (s: WebSocket) => {
        s.addEventListener('open', () => {
          cb({ type: 'CONNECTED' });
        });

        s.addEventListener('message', (e) => {
          const res: productsSockets.Resposne = JSON.parse(e.data);
          const data = res.data.map((d) =>
            createDataElement({
              s: d.s,
              b: '',
              q: d.q,
              o: +d.o,
              h: +d.h,
              l: +d.l,
              c: +d.c,
              pm: '',
              pn: '',
            })
          );
          cb({ type: 'MESSAGE', data });
        });

        s.addEventListener('error', (e) => {
          cb({ type: 'SOCKET_ERROR' });
        });
      };

      init(socket);

      onReceive((e) => {
        switch (e.type) {
          case 'RECONNECT': {
            socket = productsSockets.createProductsStream();
            init(socket);
            break;
          }
          case 'DISCONNECT': {
            socket.close();
            break;
          }
        }
      });
    },
  },
  guards: {},
  activities: {},
  delays: {},
};

export const machine = Machine(config, options);
