import React from 'react';
import { Story, Meta } from '@storybook/react';

import products from '../../mock-data/products.json';

import Widget, { Props } from './Widget';

export default {
  title: 'Widget',
  component: Widget,
} as Meta;

const Template: Story<Props> = (args) => <Widget {...args} />;

const data = products.map((p) => ({
  name: `${p.value.base}/${p.value.parentMarket}`,
  latestPrice: p.value.latestPrice,
  parentMarket: p.value.parentMarket,
}));

const options = new Set<string>();
data.forEach((d) => {
  options.add(d.parentMarket);
});

export const Primary = Template.bind({});
Primary.args = {
  columns: [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Latest Price',
      accessor: 'latestPrice',
    },
    {
      Header: 'Parent Market',
      accessor: 'parentMarket',
    },
  ],
  data,
};
