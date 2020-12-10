import React from 'react';
import { Story, Meta } from '@storybook/react';

import buckets from '../../mock-data/buckets.json';

import Candlestick, { Props } from './CandlestickChart';

export default {
  title: 'CandlestickChart',
  component: Candlestick,
} as Meta;

const Template: Story<Props> = (args) => <Candlestick {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  width: 4000,
  height: 400,
  margin: {
    left: 50,
    right: 50,
    top: 30,
    bottom: 30,
  },
  buckets,
};
