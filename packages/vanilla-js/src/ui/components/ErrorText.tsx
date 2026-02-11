import { Text } from './Text';
import React, { ReactNode, useMemo } from 'react';

const DASHBOARD_REGEX = /https:\/\/stytch\.com\/[#a-zA-Z0-9/-]+/g;

const mapURLsToLinks = (str: string) => {
  const nonLinkChunks = str.split(DASHBOARD_REGEX);
  const linkChunks = Array.from(str.matchAll(DASHBOARD_REGEX)).map((el) => el[0]);

  const chunkResults: ReactNode[] = [];

  while (nonLinkChunks.length || linkChunks.length) {
    if (nonLinkChunks.length) {
      chunkResults.push(nonLinkChunks.shift());
    }
    if (linkChunks.length) {
      const chunk = linkChunks.shift();

      chunkResults.push(
        <a key={chunk + '__' + String(linkChunks.length)} href={chunk} target="_blank" rel="noreferrer">
          {chunk}
        </a>,
      );
    }
  }

  return chunkResults;
};

export const ErrorText: React.FC<{ errorMessage: string; id?: string }> = ({ errorMessage, id }) => {
  const tokens = useMemo(() => mapURLsToLinks(errorMessage), [errorMessage]);
  return (
    <Text size="helper" color="error" id={id}>
      {tokens}
    </Text>
  );
};
