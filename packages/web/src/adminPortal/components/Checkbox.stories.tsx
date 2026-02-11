import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox as BaseCheckbox, CheckboxProps } from './Checkbox';

const Checkbox = (props: CheckboxProps): JSX.Element => {
  const [checked, setChecked] = useState<boolean>(props.checked ?? false);
  return (
    <BaseCheckbox
      {...props}
      checked={checked}
      onClick={(checkedArg, value) => {
        if (props.onClick) {
          props.onClick(checkedArg, value);
        }
        setChecked(!checked);
      }}
    />
  );
};

const meta: Meta<CheckboxProps> = {
  component: Checkbox,
};

export default meta;

type Story = StoryObj<CheckboxProps>;

export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    indeterminate: false,
    label: 'Label text',
    value: 'value',
    onClick: fn(),
  },
  argTypes: {
    autoFocus: {
      control: 'boolean',
      description: 'Should the input be focused when it is rendered',
      table: {
        type: {
          summary: 'boolean',
        },
      },
    },
    checked: {
      control: 'boolean',
      description: 'Should the checkbox be checked',
      table: {
        type: {
          summary: 'boolean',
        },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Should the checkbox be disabled',
      table: {
        type: {
          summary: 'boolean',
        },
      },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Should the checkbox value be indeterminate',
      table: {
        type: {
          summary: 'boolean',
        },
      },
    },
    label: {
      control: 'text',
      description: 'The label to display next to the checkbox',
      table: {
        type: {
          summary: 'ReactNode',
        },
      },
    },
    value: {
      control: 'text',
      description: 'The HTML name for the checkbox',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    onClick: {
      description: 'Function called when the input is clicked',
      table: {
        type: {
          summary: '(checked: boolean, value: string) => void',
        },
      },
    },
  },
  tags: ['!autodocs'],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Label text')).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox'));
    await expect(args.onClick).toHaveBeenCalled();
    await expect(canvas.getByRole('checkbox')).toBeChecked();
  },
} satisfies Story;

export const CheckboxVariations = (): JSX.Element => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      <Checkbox checked={true} label="Checked" />
      <Checkbox checked={false} label="Unchecked" />
      <Checkbox indeterminate={true} label="Indeterminate" />
      <Checkbox checked={true} disabled label="Checked (disabled)" />
      <Checkbox checked={false} disabled label="Unchecked (disabled)" />
      <Checkbox disabled indeterminate={true} label="Indeterminate (disabled)" />
    </div>
  );
};
