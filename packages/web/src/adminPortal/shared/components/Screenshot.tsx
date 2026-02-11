import { styled } from '@mui/material/styles';
import React from 'react';

const Image = styled('img')(({ theme }) => ({
  '&': {
    alignSelf: 'start',
    maxWidth: 'min(100%, 1200px)',
    margin: `${theme.spacing(1)} 0`,
    display: 'block',
  },
}));

export const Screenshot = ({ src, hasRetina = true, alt }: { src: string; hasRetina?: boolean; alt: string }) => {
  return (
    <Image
      src={src}
      // We'll assume the image is a png, screenshots should probably not be in any other format
      srcSet={hasRetina ? `${src.replace(/\.png$/, '.2x.png')} 2x` : undefined}
      alt={alt}
    />
  );
};
