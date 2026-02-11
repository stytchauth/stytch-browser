import { ExpandMore } from '@mui/icons-material';
import { AccordionProps, AccordionSummary } from '@mui/material';
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';

export { Accordion as AccordionCore, AccordionDetails as AccordionDetailsCore } from '@mui/material';

interface useAccordionProps {
  defaultValue: boolean;
}

type AccordionBehavior = Pick<AccordionProps, 'expanded' | 'onChange'> & {
  setExpanded: Dispatch<SetStateAction<boolean>>;
};

export const useAccordion = ({ defaultValue }: useAccordionProps = { defaultValue: false }): AccordionBehavior => {
  const [expanded, setExpanded] = useState(defaultValue);
  const onChange: NonNullable<AccordionProps['onChange']> = useCallback(
    (event, expanded) => {
      setExpanded(expanded);
    },
    [setExpanded],
  );

  return { expanded, onChange, setExpanded };
};

export const AccordionSummaryCore = (props: React.ComponentProps<typeof AccordionSummary>): JSX.Element => {
  return <AccordionSummary expandIcon={<ExpandMore fontSize="large" />} {...props} />;
};
