import { DeleteOutlined, EditOutlined, VisibilityOutlined } from '@mui/icons-material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { action } from 'storybook/actions';

import { ActionMenu, ActionMenuProps } from './ActionMenu';

const meta = {
  component: ActionMenu,
  args: {
    actions: [
      { key: 'action1', label: 'Action 1', onClick: action('action 1'), icon: <VisibilityOutlined /> },
      { key: 'action2', label: 'Action 2', onClick: action('action 2'), icon: <EditOutlined /> },
      { key: 'action3', label: 'Action 3', onClick: action('action 3'), icon: <DeleteOutlined />, isDangerous: true },
    ],
    idPrefix: 'action-menu',
    item: {},
  },
  parameters: {
    adminPortal: true,
  },
} satisfies Meta<ActionMenuProps<unknown>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _ActionMenu = {} satisfies Story;
