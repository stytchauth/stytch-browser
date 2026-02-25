import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { action } from 'storybook/actions';

import { FilterMenu, FilterMenuProps } from './FilterMenu';

const TestFilterMenu = (props: Omit<FilterMenuProps, 'onChange'>) => {
  const [value, setValue] = useState(props.value);
  return <FilterMenu {...props} value={value} onChange={setValue} />;
};

const meta = {
  component: FilterMenu,
  args: {
    items: [
      { label: 'Item 1', value: 'item1' },
      { label: 'Item 2', value: 'item2' },
    ],
    value: new Set(['item1']),
    onChange: action('onChange'),
  },
  parameters: {
    adminPortal: true,
  },
} satisfies Meta<FilterMenuProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _FilterMenu = {} satisfies Story;

export const Demo = {
  render: (args) => <TestFilterMenu {...args} />,
} satisfies Story;
