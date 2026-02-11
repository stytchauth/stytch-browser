// This order is important - we need mixins to appear first so later styles can override them
import '../mixins';

import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import React, { CSSProperties, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { useMediaQuery } from '../../hooks/useMediaQuery';
import Column from '../atoms/Column';
import { ToastContainer } from '../atoms/Toast';
import Watermark from '../atoms/Watermark';
import { Theme } from '../themes/ThemeConfig';
import styles from './MainContainer.module.css';

export type MainContainerProps = {
  children: ReactNode;
  displayWatermark: boolean;
  theme: Theme;
};

const MainContainer = ({ children, displayWatermark, theme }: MainContainerProps) => {
  const { t } = useLingui();

  const ref = useRef<HTMLDivElement>(null);
  const { className, style } = useRootStyles(theme, ref);

  return (
    <Column gap={6} style={style} className={classNames(styles.container, className)} ref={ref}>
      {children}

      {displayWatermark && (
        <div className={styles.watermarkContainer}>
          <Watermark
            poweredBy={t({ id: 'watermark.poweredBy', message: 'Powered by' })}
            label={t({ id: 'watermark.altText', message: 'Stytch by Twilio' })}
          />
        </div>
      )}

      <ToastContainer />
    </Column>
  );
};

export function useRootStyles(theme: Theme, ref: RefObject<HTMLDivElement>) {
  const rawBreakpoint = theme['mobile-breakpoint'];

  // Media queries don't play well with CSS custom properties, so as a workaround we parse var() expressions out of the
  // breakpoint string and replace them with values resolved using getComputedStyle().
  const [breakpoint, setBreakpoint] = useState(rawBreakpoint);
  useEffect(() => {
    setBreakpoint(parseCssVar(rawBreakpoint, ref.current));
  }, [rawBreakpoint, ref]);

  const isMobile = useMediaQuery(`(max-width: ${breakpoint})`);
  const themeVariables = useMemo(() => themeToCssVariables(theme), [theme]);

  return {
    style: themeVariables,
    className: classNames({ '-st-mobile': isMobile }),
  };
}

export function themeToCssVariables(theme: Theme) {
  const { 'color-scheme': colorScheme, ...themeVariables } = theme;
  const variables = Object.fromEntries(
    // eslint-disable-next-line lingui/no-unlocalized-strings
    Object.entries(themeVariables).map(([key, value]) => [`--st-${key}`, value]),
  );

  if (theme['color-scheme'] === 'shadcn') {
    variables['--st-color-scheme'] = 'inherit';
  } else {
    variables['--st-color-scheme'] = colorScheme;
    variables['--st-dark-mode'] = theme['color-scheme'] === 'dark' ? '1' : '0';
  }

  return variables as CSSProperties;
}

export function parseCssVar(value: string, element: HTMLElement | null): string {
  if (!element) return value;

  // Ideally we would use CSSStyleValue.parse() instead of regex, but that's not currently well supported
  // https://caniuse.com/mdn-api_cssstylevalue_parse_static
  const replaced = value.replace(/var\s*\([^)]+\)/gi, (r) => {
    // r is going to be var(..., ...), so we use a similar regex with a capture group to match the stuff in the brackets
    // variable should always exist but defaultValue may not
    const [variable, defaultValue] = r
      .match(/\(([^)]+)\)/)![1]
      .split(',')
      .map((s) => s.trim());
    const propertyValue = window.getComputedStyle(element).getPropertyValue(variable);
    return propertyValue || defaultValue || r;
  });

  return replaced === value ? replaced : parseCssVar(replaced, element);
}

export default MainContainer;
