import React from 'react';
import CreateIcon from './CreateIcon';

const LoadingIconSvg = () => (
  <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.99999 4.16667V0.833336L2.83333 5L6.99999 9.16667V5.83334C9.75833 5.83334 12 8.075 12 10.8333C12 13.5917 9.75833 15.8333 6.99999 15.8333C4.24166 15.8333 1.99999 13.5917 1.99999 10.8333H0.333328C0.333328 14.5167 3.31666 17.5 6.99999 17.5C10.6833 17.5 13.6667 14.5167 13.6667 10.8333C13.6667 7.15 10.6833 4.16667 6.99999 4.16667Z"
      fill="#ADBCC5"
    />
  </svg>
);

export default CreateIcon(LoadingIconSvg, { wrapped: false });
