import React from 'react';
import CreateIcon from './CreateIcon';

export const GenericWalletIconSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.5 4.28V2C18.5 0.9 17.6 0 16.5 0H2.5C1.39 0 0.5 0.9 0.5 2V16C0.5 17.1 1.39 18 2.5 18H16.5C17.6 18 18.5 17.1 18.5 16V13.72C19.09 13.37 19.5 12.74 19.5 12V6C19.5 5.26 19.09 4.63 18.5 4.28ZM17.5 6V12H10.5V6H17.5ZM2.5 16V2H16.5V4H10.5C9.4 4 8.5 4.9 8.5 6V12C8.5 13.1 9.4 14 10.5 14H16.5V16H2.5Z"
      fill="black"
    />
    <path
      d="M13.5 10.5C14.3284 10.5 15 9.82843 15 9C15 8.17157 14.3284 7.5 13.5 7.5C12.6716 7.5 12 8.17157 12 9C12 9.82843 12.6716 10.5 13.5 10.5Z"
      fill="black"
    />
  </svg>
);

export default CreateIcon(GenericWalletIconSvg);
