import { addons, types } from 'storybook/manager-api';

import { Tool } from './Tool';

addons.register('locale-test-switcher', () => {
  addons.add('locale-test-switcher-tool', {
    type: types.TOOL,
    title: 'Locale Test Switcher',
    render: Tool,
    paramKey: 'localeTestSwitcher',
  });
});
