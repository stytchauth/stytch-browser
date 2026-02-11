import isChromatic from 'chromatic/isChromatic';

export const chromaticIgnoreClassName = () => (isChromatic() ? 'chromatic-ignore' : undefined);
