import React from 'react';
import { Story, Meta } from '@storybook/react';

import Canvas, { Props } from './Canvas';

export default {
  title: 'Canvas',
  component: Canvas,
} as Meta;

const Template: Story<Props> = (args) => <Canvas {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  width: 500,
  height: 500,
  draw: (ctx) => {
    ctx.clearRect(0, 0, 500, 500);
    ctx.fillRect(0, 0, 500, 500);
  },
};
