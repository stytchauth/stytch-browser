import React, { ReactNode } from 'react';
import Button from './Button';
import { Flex } from './Flex';

type Props = {
  walletTypeTitle: string;
  icon?: ReactNode;
  onClick: () => void;
};

export const WalletButton = (props: Props) => {
  return (
    <Button id={`wallet-${props.walletTypeTitle}`} type="button" onClick={props.onClick} variant="outlined">
      <Flex justifyContent="center" alignItems="center" gap={4}>
        {props.icon}
        <span style={{ verticalAlign: 'middle' }}>{props.walletTypeTitle}</span>
      </Flex>
    </Button>
  );
};
