import styled from 'styled-components';

type TextSize = 'header' | 'body' | 'helper';
type TextColor = 'primary' | 'secondary' | 'success' | 'error';

type TextProps = {
  size?: TextSize;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
};

export const Text = styled.div<TextProps>`
  color: ${(props) => props.color && props.theme.colors[props.color]};
  text-align: ${(props) => props.align};
  ${(props) => props.size && props.theme.typography[props.size]};
`;

Text.defaultProps = {
  size: 'body',
  color: 'primary',
  align: 'left',
};
