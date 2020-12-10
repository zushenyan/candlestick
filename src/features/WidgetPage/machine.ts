/* eslint-disable @typescript-eslint/no-explicit-any */
// to resolve this issue https://github.com/davidkpiano/xstate/issues/1198#issuecomment-632899035
import {
  Machine,
  MachineOptions,
  MachineConfig,
  DoneInvokeEvent,
  assign,
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

export interface Context {
  data: Map<string, DataElement>;
}

export interface States {
  states: {
    init: Record<string, unknown>;
    ready: Record<string, unknown>;
    errorSocket: Record<string, unknown>;
    errorData: Record<string, unknown>;
  };
}

export type MessageEvent = {
  type: 'MESSAGE';
  data: DataElement[];
};
export type SocketErrorEvent = { type: 'SOCKET_ERROR' };
export type Events = MessageEvent | SocketErrorEvent;

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

export const config: MachineConfig<Context, States, Events> = {
  initial: 'init',
  states: {
    init: {
      invoke: {
        id: 'getData',
        src: 'getData',
        onDone: {
          target: 'ready',
          actions: 'setData',
        },
        onError: 'errorData',
      },
    },
    ready: {
      invoke: {
        id: 'initSocket',
        src: 'initProductsStream',
      },
      on: {
        MESSAGE: {
          actions: ['setStreamData'],
        },
        SOCKET_ERROR: 'errorSocket',
      },
    },
    errorSocket: {},
    errorData: {},
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
    initProductsStream: (context: Context, events: Events) => (
      cb,
      onReceive
    ) => {
      const socket = productsSockets.createProductsStream();
      socket.addEventListener('message', (e) => {
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
      socket.addEventListener('error', (e) => {
        cb({ type: 'SOCKET_ERROR' });
      });
    },
  },
  guards: {},
  activities: {},
  delays: {},
};

export const machine = Machine(config, options);
