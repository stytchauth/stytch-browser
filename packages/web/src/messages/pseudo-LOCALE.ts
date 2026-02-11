import { Messages } from '@lingui/core';

import { messages as _adminPortalMessages } from '../../messages/adminPortal/pseudo-LOCALE.json';
import { messages as _b2bMessages } from '../../messages/b2b/pseudo-LOCALE.json';
import { messages as _messages } from '../../messages/pseudo-LOCALE.json';

export const messages = _messages as unknown as Messages;
export const adminPortalMessages = _adminPortalMessages as unknown as Messages;
export const b2bMessages = _b2bMessages as unknown as Messages;
