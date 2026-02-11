import { SCIMConnectionWithBearerToken } from '@stytch/core/public';
import React, { useState } from 'react';

import { Accordion, AccordionDetails, AccordionSummary } from '../components/Accordion';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { FlexBox } from '../components/FlexBox';
import { SCIMFields } from '../components/ScimFields';
import { Typography } from '../components/Typography';
import { getSCIMIdpInfo, SCIMIdpInfo } from './scimInfo';
import { useScimRouterController } from './SCIMRouter';

export const SCIMNewConnectionConfigureScreen = ({ connection }: { connection: SCIMConnectionWithBearerToken }) => {
  const { navigate } = useScimRouterController();
  const { copyToIdpLabel, copyToIdpFields, confirmLabel, confirmFields }: SCIMIdpInfo = getSCIMIdpInfo(
    connection.identity_provider,
  );

  const connectionDisplayName = connection.display_name;
  const defaultExpanded = confirmFields === undefined;
  const [hasUserConfirmedCopyToIdp, setHasUserConfirmedCopyToIdp] = useState(false);

  return (
    <FlexBox flexDirection="column" gap={3}>
      <Typography variant="h2">Configure {connectionDisplayName}</Typography>
      <div>
        <Accordion defaultExpanded={defaultExpanded}>
          <AccordionSummary>
            <Typography>{copyToIdpLabel}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FlexBox flexDirection="column" gap={2}>
              <SCIMFields fields={copyToIdpFields} connection={connection} />
              <Checkbox
                label="I have copied the above values to my IdP."
                checked={hasUserConfirmedCopyToIdp}
                onClick={(value) => setHasUserConfirmedCopyToIdp(value)}
              />
            </FlexBox>
          </AccordionDetails>
        </Accordion>
        {confirmFields && (
          <Accordion>
            <AccordionSummary>
              <Typography>{confirmLabel}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FlexBox flexDirection="column" gap={2}>
                <SCIMFields fields={confirmFields} connection={connection} />
              </FlexBox>
            </AccordionDetails>
          </Accordion>
        )}
      </div>

      <Button
        disabled={!hasUserConfirmedCopyToIdp}
        onClick={() => {
          navigate({
            screen: 'scimConnection',
          });
        }}
      >
        Done
      </Button>
    </FlexBox>
  );
};
