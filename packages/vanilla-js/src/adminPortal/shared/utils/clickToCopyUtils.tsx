import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import FileCopyOutlined from '@mui/icons-material/FileCopyOutlined';
import React, { MouseEvent, MouseEventHandler, ReactNode, useState } from 'react';
import { styled } from '@mui/material';

const CheckCircle = styled(CheckCircleOutlined)({
  display: 'block !important',
});

export interface UseClickToCopyCoreParams {
  iconSize?: 'inherit' | 'small' | 'medium' | 'large';
  text: string;
}

export interface UseClickToCopyCoreReturnType {
  copied: boolean;
  copyToClipboard: (e: MouseEvent<HTMLElement>) => void;
  CopyIcon: ReactNode;
}

export const useClickToCopyCore = ({
  iconSize = 'small',
  text,
}: UseClickToCopyCoreParams): UseClickToCopyCoreReturnType => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard: MouseEventHandler = (e) => {
    e.stopPropagation();
    setCopied(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopied(false), 1000);
  };

  const CopyIcon = copied ? <CheckCircle fontSize={iconSize} /> : <FileCopyOutlined fontSize={iconSize} />;

  return { copied, copyToClipboard, CopyIcon };
};
