import styled, { DefaultTheme } from 'styled-components';
import Button from './Button';

/**
 * A <button> with <Text> styling. This is very similar to <Button variant="text"> but it
 * has slightly different text formatting and no fixed height
 */
export const HelpButton = styled(Button).attrs({
  variant: 'text',
  type: 'button',
})<{
  /** @default secondary */
  themeColor?: keyof DefaultTheme['colors'];
}>`
  ${(props) => props.theme.typography.body};
  color: ${({ theme, themeColor = 'secondary' }) => theme.colors[themeColor]};
  font-weight: bold;
  height: auto;
`;
