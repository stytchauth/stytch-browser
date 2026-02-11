import React, { useState } from 'react';
import { SCIMConnectionWithBearerToken } from '@stytch/core/public';
import { SCIMIdpInfo, getSCIMIdpInfo } from './scimInfo';
import { FlexBox } from '../components/FlexBox';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { Accordion, AccordionDetails, AccordionSummary } from '../components/Accordion';
import { Checkbox } from '../components/Checkbox';
import { useScimRouterController } from './SCIMRouter';
import { SCIMFields } from '../components/ScimFields';

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
