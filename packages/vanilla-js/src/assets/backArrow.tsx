import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useLingui } from '@lingui/react/macro';
import { BaseButton } from '../ui/components/BaseButton';
import { focusedRing } from '../utils/accessibility';

const BackButton = styled(BaseButton)`
  &:focus-visible {
    // Move the focus ring to the inner SVG
    outline: none;

    svg {
      ${focusedRing}
    }
  }
`;

const BackArrowSvg = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill={color} />
  </svg>
);

const BackArrow = ({ onClick }: { onClick?: () => void }) => {
  const theme = useTheme();
  const { t } = useLingui();

  return (
    <BackButton type="button" onClick={onClick} aria-label={t({ id: 'button.back.ariaLabel', message: 'Back' })}>
      <BackArrowSvg color={theme.colors.primary} />
    </BackButton>
  );
};

export default BackArrow;
