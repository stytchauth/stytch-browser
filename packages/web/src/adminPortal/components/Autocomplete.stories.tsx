import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Autocomplete, AutocompleteProps } from './Autocomplete';

interface FakeItem {
  label: string;
  value: string;
}

const fakeItems = [
  { label: 'Item 1', value: 'item1' },
  { label: 'Item 2', value: 'item2' },
  { label: 'Item 3', value: 'item3' },
  { label: 'Item 4 has a long label', value: 'item4' },
  { label: 'Item 5 has an even longer label than goes on and on and on and on', value: 'item5' },
] as const satisfies FakeItem[];

const manyItems = Array.from(
  { length: 100 },
  (_, i) =>
    ({
      label: `Item ${i + 1}`,
      value: `item${i + 1}`,
    }) satisfies FakeItem,
);

const Interactive = (props: Omit<AutocompleteProps<FakeItem>, 'onChange' | 'value'>) => {
  const [value, setValue] = React.useState<FakeItem[]>(props.selectItems.slice(0, 2));

  return <Autocomplete {...props} onChange={setValue} value={value} />;
};

const meta = {
  component: Autocomplete,
  args: {
    selectItems: fakeItems,
    value: [fakeItems[0]],
    getOptionLabel: (item) => item.label,
  },
  parameters: {
    adminPortal: true,
  },
} satisfies Meta<AutocompleteProps<FakeItem>>;

export default meta;

type Story = StoryObj<AutocompleteProps<FakeItem>>;

export const _Autocomplete = {} satisfies Story;

export const InteractiveDemo = {
  render: (args) => <Interactive {...args} />,
} satisfies Story;

export const NoSelection = {
  args: {
    value: [],
    placeholder: 'Placeholder text',
  },
} satisfies Story;

export const MultipleSelection = {
  args: {
    value: [...fakeItems],
  },
} satisfies Story;

export const ManyItems = {
  args: {
    selectItems: manyItems,
    value: manyItems.slice(2, 5),
  },
} satisfies Story;

export const WithDescriptions = {
  args: {
    getOptionDescription: (item) => `Description of ${item.label}`,
  },
} satisfies Story;

export const WithDisabledItems = {
  args: {
    getOptionDisabled: (item) => (fakeItems.slice(0, 2) as FakeItem[]).includes(item),
  },
} satisfies Story;

export const WithText = {
  args: {
    caption: 'Field caption',
    label: 'Field label',
    required: true,
  },
} satisfies Story;

export const FullWidth = {
  args: {
    fullWidth: true,
  },
} satisfies Story;
