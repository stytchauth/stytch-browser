import styled, { DefaultTheme } from 'styled-components';

type Props =
  | {
      color: string;
    }
  | {
      themeColor: keyof DefaultTheme['colors'];
    };

/**
 * Wrapper to override icon colors, assuming the icons are SVG outlines
 */
export const IconColorOverride = styled.div<Props>`
  display: contents; // Try to be as transparent as possible as a wrapper div

  path {
    fill: ${(props) => {
      if ('color' in props) return props.color;
      if ('themeColor' in props) return props.theme.colors[props.themeColor];
    }};
  }
`;
