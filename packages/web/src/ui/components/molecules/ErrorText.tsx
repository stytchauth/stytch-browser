import React, { HTMLAttributes, ReactNode, useMemo, useState } from 'react';

import { useMountEffect } from '../../hooks/useMountEffect';
import Typography from '../atoms/Typography';

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

type ErrorTextProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & { children: string };

const ErrorText = ({ children, ...props }: ErrorTextProps) => {
  const tokens = useMemo(() => mapURLsToLinks(children), [children]);

  // HACK: Screen readers only read elements in aria-live regions if they are new or changed. We first render the
  // aria-live div, then render the inner children second so the error message is "new" and therefore read out
  const [render, setRender] = useState(false);
  useMountEffect(() => setRender(true));

  return (
    <div aria-live="polite">
      {render && (
        <Typography {...props} variant="helper" color="destructive" key={children}>
          {tokens}
        </Typography>
      )}
    </div>
  );
};

export default ErrorText;
