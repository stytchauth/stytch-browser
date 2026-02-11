import styled from 'styled-components';

type GlobalValues = 'inherit' | 'initial' | 'unset';

type ContentOptions =
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'center'
  | 'stretch'
  | 'flex-start'
  | 'flex-end'
  | 'normal'
  | GlobalValues;

type AlignItemsOptions =
  | 'normal'
  | 'stretch'
  | 'center'
  | 'start'
  | 'flex-start'
  | 'flex-end'
  | 'baseline'
  | GlobalValues;

type Directions = 'row' | 'row-reverse' | 'column' | 'column-reverse' | GlobalValues;

type AlignSelfOptions = 'auto' | 'normal' | 'center' | 'flex-start' | 'flex-end' | GlobalValues;

type FlowOptions =
  | 'row'
  | 'row-reverse'
  | 'column'
  | 'column-reverse'
  | 'nowrap'
  | 'wrap'
  | 'wrap-reverse'
  | 'row|nowrap'
  | 'column|wrap'
  | 'column-reverse|wrap-reverse'
  | GlobalValues;

type WrapOptions = 'nowrap' | 'wrap' | 'wrap-reverse' | GlobalValues;

export type FlexProps = {
  readonly justifyContent?: ContentOptions;
  readonly alignContent?: ContentOptions;
  readonly alignItems?: AlignItemsOptions;
  readonly direction?: Directions;
  readonly alignSelf?: AlignSelfOptions;
  readonly flow?: FlowOptions;
  readonly wrap?: WrapOptions;
  readonly grow?: number | GlobalValues;
  readonly shrink?: number | GlobalValues;
  readonly order?: number | GlobalValues;
  readonly inline?: boolean;

  // layout props
  readonly width?: number | string;
  readonly height?: number | string;
  readonly maxWidth?: number | string;
  readonly maxHeight?: number | string;
  readonly minWidth?: number | string;
  readonly minHeight?: number | string;
  readonly padding?: number | 'auto';
  readonly margin?: number | 'auto';
  readonly paddingTop?: number | 'auto';
  readonly paddingRight?: number | 'auto';
  readonly paddingBottom?: number | 'auto';
  readonly paddingLeft?: number | 'auto';
  readonly marginTop?: number | 'auto';
  readonly marginRight?: number | 'auto';
  readonly marginBottom?: number | 'auto';
  readonly marginLeft?: number | 'auto';

  // special props
  readonly center?: boolean;
  readonly gap?: number;
};

const itemOrNone = (item: string | number | undefined | null) => item ?? undefined;
const spaceOrNone = (space: number | 'auto' | undefined | null) => (space ? `${space}px` : undefined);

export const Flex = styled.div<FlexProps>`
  display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};

  flex-direction: ${({ direction }) => itemOrNone(direction)};
  justify-content: ${({ justifyContent, center }) => (center ? 'center' : itemOrNone(justifyContent))};
  align-items: ${({ alignItems, center }) => (center ? 'center' : itemOrNone(alignItems))};
  flex-grow: ${({ grow }) => itemOrNone(grow)};
  flex-shrink: ${({ shrink }) => itemOrNone(shrink)};
  order: ${({ order }) => itemOrNone(order)};
  align-self: ${({ alignSelf }) => itemOrNone(alignSelf)};
  flex-flow: ${({ flow }) => itemOrNone(flow)};
  flex-wrap: ${({ wrap }) => itemOrNone(wrap)};

  width: ${({ width }) => (typeof width === 'string' ? width : spaceOrNone(width))};
  height: ${({ height }) => (typeof height === 'string' ? height : spaceOrNone(height))};
  max-width: ${({ maxWidth }) => (typeof maxWidth === 'string' ? maxWidth : spaceOrNone(maxWidth))};
  max-height: ${({ maxHeight }) => (typeof maxHeight === 'string' ? maxHeight : spaceOrNone(maxHeight))};
  min-width: ${({ minWidth }) => (typeof minWidth === 'string' ? minWidth : spaceOrNone(minWidth))};
  min-height: ${({ minHeight }) => (typeof minHeight === 'string' ? minHeight : spaceOrNone(minHeight))};
  padding: ${({ padding }) => spaceOrNone(padding)};
  margin: ${({ margin }) => spaceOrNone(margin)};
  margin-top: ${({ marginTop }) => spaceOrNone(marginTop)};
  margin-right: ${({ marginRight }) => spaceOrNone(marginRight)};
  margin-bottom: ${({ marginBottom }) => spaceOrNone(marginBottom)};
  margin-left: ${({ marginLeft }) => spaceOrNone(marginLeft)};
  padding-top: ${({ paddingTop }) => spaceOrNone(paddingTop)};
  padding-right: ${({ paddingRight }) => spaceOrNone(paddingRight)};
  padding-bottom: ${({ paddingBottom }) => spaceOrNone(paddingBottom)};
  padding-left: ${({ paddingLeft }) => spaceOrNone(paddingLeft)};

  gap: ${({ gap }) => spaceOrNone(gap)};
`;
