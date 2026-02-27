import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { InputType } from 'storybook/internal/csf';
import { useArgs, useGlobals } from 'storybook/preview-api';

import { themes } from '../../../../.storybook/themeDecorator';
import Button, { ButtonAnchor } from '../atoms/Button';
import { CircularProgress } from '../atoms/CircularProgress';
import CodeContainer from '../atoms/CodeContainer';
import Column from '../atoms/Column';
import Typography from '../atoms/Typography';
import { Badge } from '../molecules/Badge';
import Divider from '../molecules/Divider';
import EmailInput from '../molecules/EmailInput';
import Input from '../molecules/Input';
import MainContainer from '../molecules/MainContainer';
import OtpInput from '../molecules/OtpInput';
import { PasswordInput } from '../molecules/PasswordInput';
import { isDynamicTheme } from '../PresentationConfig';
import { Theme } from './ThemeConfig';
import { defaultTheme } from './themes';

const noop = () => {
  // noop
};

type StoryArgs = Theme & {
  displayWatermark: boolean;
};

const argTypes: Record<keyof Theme, InputType> = {
  'color-scheme': { control: 'text' },
  'container-width': { control: 'text' },
  'destructive-foreground': { control: 'text' },
  'font-family': { control: 'text' },
  'font-family-mono': { control: 'text' },
  'mobile-breakpoint': { control: 'text' },
  'rounded-base': { control: 'text' },
  'text-base': { control: 'text' },
  'transition-duration': { control: 'text' },
  spacing: { control: 'text' },
  'header-font': { control: 'text' },
  'button-radius': { control: 'text' },
  'input-radius': { control: 'text' },
  'container-radius': { control: 'text' },
  shadow: { control: 'text' },
  'shadow-button': { control: 'text' },
  'shadow-input': { control: 'text' },
  'container-border': { control: 'text' },

  background: { control: { type: 'color' } },
  foreground: { control: { type: 'color' } },
  primary: { control: { type: 'color' } },
  'primary-foreground': { control: { type: 'color' } },
  secondary: { control: { type: 'color' } },
  'secondary-foreground': { control: { type: 'color' } },
  muted: { control: { type: 'color' } },
  'muted-foreground': { control: { type: 'color' } },
  accent: { control: { type: 'color' } },
  'accent-foreground': { control: { type: 'color' } },
  border: { control: { type: 'color' } },
  input: { control: { type: 'color' } },
  ring: { control: { type: 'color' } },
  destructive: { control: { type: 'color' } },
  warning: { control: { type: 'color' } },
  success: { control: { type: 'color' } },

  'tab-background': { control: { type: 'color' } },
  'primary-button-hover': { control: { type: 'color' } },
  'secondary-button-hover': { control: { type: 'color' } },
  'destructive-button-hover': { control: { type: 'color' } },
  'divider-color': { control: { type: 'color' } },
  'focus-ring-shadow': { control: { type: 'color' } },
};

const meta = {
  parameters: {
    rootWidth: 'none',
  },
  argTypes,
  args: {
    displayWatermark: true,
  },
  render: function Render() {
    const [globals] = useGlobals();
    const [args, setArgs] = useArgs<StoryArgs>();

    const [selectedTheme, setSelectedTheme] = useState(globals.theme as keyof typeof themes);
    const resolvedTheme = themes[selectedTheme] ?? defaultTheme;
    const presetTheme = isDynamicTheme(resolvedTheme) ? defaultTheme : resolvedTheme;

    const { displayWatermark, ...themeOverrides } = args;
    return (
      <MainContainer
        theme={{
          ...presetTheme,
          ...themeOverrides,
        }}
        displayWatermark={displayWatermark}
      >
        <Column gap={4}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <select
              value={selectedTheme}
              onChange={(evt) => setSelectedTheme(evt.target.value as keyof typeof themes)}
              style={{ padding: '4px 8px', width: '100px' }}
            >
              {Object.keys(themes).map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>

            <Button
              block={false}
              variant="primary"
              onClick={() => {
                setArgs(presetTheme);
              }}
            >
              Copy theme values
            </Button>

            <Button
              block={false}
              variant="outline"
              onClick={() => {
                setArgs(Object.fromEntries(Object.entries(args).map(([k]) => [k, undefined])));
              }}
            >
              Clear
            </Button>
          </div>

          <Typography variant="header">Typography Examples</Typography>
          <Typography variant="body">Body text showing foreground color</Typography>
          <Typography variant="helper">Helper text showing muted-foreground color</Typography>
          <Typography variant="body" color="destructive">
            Destructive text color
          </Typography>
          <Typography variant="body" color="warning">
            Warning text color
          </Typography>
          <Typography variant="body" color="success">
            Success text color
          </Typography>
          <CodeContainer>
            <Typography font="mono">22o0-e6e9-plwt</Typography>
          </CodeContainer>

          <Divider />

          <Typography variant="header">Button Examples</Typography>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="primary" disabled>
            Disabled Primary Button
          </Button>

          <ButtonAnchor variant="primary" href="https://example.com">
            Button Anchor
          </ButtonAnchor>

          <Typography variant="header">Input Examples</Typography>
          <Input label="Text Input" id="text" placeholder="Enter text" />
          <Input label="Input with Error" id="error" error="This field is required" />
          <EmailInput email="test@example.com" setEmail={noop} />
          <PasswordInput password="TestMcTestPassword" setPassword={noop} type="current" />
          <OtpInput onSubmit={noop} />

          <Typography variant="header">Other components</Typography>
          <Badge>Accent Badge</Badge>
          <CircularProgress size={24} />
        </Column>
      </MainContainer>
    );
  },
} satisfies Meta<StoryArgs>;

export default meta;

// Not using the Story typing since I don't want to provide default values for any of the theme args
type _Story = StoryObj<typeof meta>;

export const _Theme = {};

// Story to test style isolation from existing parent stylesheet
export const StyleIsolation = {
  render: function Render() {
    // language=CSS
    const [style, setStyle] = useState(
      `span,
p,
button,
a {
  color: #19303d;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 25px;
}
    `.trim(),
    );

    return (
      <>
        <style>{style}</style>

        <textarea
          style={{ width: '100%', height: '300px', marginBottom: '20px' }}
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        ></textarea>

        {meta.render()}
      </>
    );
  },
};
