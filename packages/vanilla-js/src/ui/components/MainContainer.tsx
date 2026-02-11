import React from 'react';
import { useLingui } from '@lingui/react/macro';
import styled from 'styled-components';
import { Snackbar } from './Snackbar';

const OuterContainer = styled.div<{ displayWatermark: boolean }>`
  width: ${({ theme }) => theme.container.width};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  box-sizing: border-box;
  * {
    box-sizing: content-box;
  }
  background-color: ${({ theme }) => theme.container.backgroundColor};
  border: ${({ theme }) => theme.container.border};
  border-radius: ${({ theme }) => theme.container.borderRadius};
  border-bottom-left-radius: ${({ theme, displayWatermark }) =>
    displayWatermark ? '0' : theme.container.borderRadius};
  border-bottom-right-radius: ${({ theme, displayWatermark }) =>
    displayWatermark ? '0' : theme.container.borderRadius};
  border-bottom: ${({ theme, displayWatermark }) => (displayWatermark ? 'none' : theme.container.border)};
`;

const ChildrenContainer = styled.div`
  padding: 24px 32px;
`;

const WatermarkContainer = styled.div`
  box-sizing: border-box;
  width: ${({ theme }) => theme.container.width};
  background-color: ${({ theme }) => theme.container.backgroundColor};
  border: ${({ theme }) => theme.container.border};
  border-top: none;
  border-bottom-left-radius: ${({ theme }) => theme.container.borderRadius};
  border-bottom-right-radius: ${({ theme }) => theme.container.borderRadius};
  overflow: hidden;
`;

const InnerContainer = styled.div`
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
`;

const Image = styled.img`
  width: 150px;
`;

const POWERED_BY_STYTCH_IMG_URL = 'https://public-assets.stytch.com/powered_by_stytch_logo_dark.svg';

export const LoadingContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <OuterContainer displayWatermark={false}>
      <ChildrenContainer>{children}</ChildrenContainer>
    </OuterContainer>
  );
};

export const MainContainer = ({
  children,
  displayWatermark,
}: {
  children: React.ReactNode;
  displayWatermark: boolean;
}) => {
  const { t } = useLingui();
  return (
    <>
      <OuterContainer displayWatermark={displayWatermark}>
        <ChildrenContainer>
          {children}
          <Snackbar />
        </ChildrenContainer>
      </OuterContainer>
      {displayWatermark && (
        <WatermarkContainer>
          <InnerContainer>
            <a
              style={{ height: 32, display: 'flex', alignItems: 'center', padding: '8px 0px', boxSizing: 'border-box' }}
              href="https://stytch.com/"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                alt={t({ id: 'watermark.altText', message: 'Powered by Stytch' })}
                src={POWERED_BY_STYTCH_IMG_URL}
              ></Image>
            </a>
          </InnerContainer>
        </WatermarkContainer>
      )}
    </>
  );
};
