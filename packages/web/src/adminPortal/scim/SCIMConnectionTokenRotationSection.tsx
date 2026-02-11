import Add from '@mui/icons-material/Add';
import { SCIMConnection, SCIMConnectionWithNextBearerToken } from '@stytch/core/public';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';

import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { FlexBox } from '../components/FlexBox';
import { Modal, useModalState } from '../components/Modal';
import { SCIMFields } from '../components/ScimFields';
import { Table } from '../components/Table';
import { Typography } from '../components/Typography';
import { NO_VALUE } from '../utils/noValue';
import { prependAsterisks } from '../utils/prependAsterisks';
import { useMutateWithToast } from '../utils/useMutateWithToast';
import { useRbac } from '../utils/useRbac';
import { scimGetConnectionKey } from '../utils/useScimConnection';
import { useStytchClient } from '../utils/useStytchClient';
import { ConnectionWithNextBearerTokenKey, DEFAULT_HEADER_BEARER_TOKEN_LABEL, Field, getFieldBy } from './scimInfo';

const tokenRotationItemRenderers = ({
  isCurrent,
  tokenTitle,
  tokenLastFour,
  tokenExpiresAt,
}: {
  isCurrent: boolean;
  tokenTitle: string;
  tokenLastFour: string | undefined;
  tokenExpiresAt: string | undefined;
}) => [
  {
    title: `${isCurrent ? 'Current' : 'Next'} ${tokenTitle}`,
    getValue: () => {
      return <Typography variant="body2">{tokenLastFour ? prependAsterisks(tokenLastFour) : NO_VALUE}</Typography>;
    },
    width: 300,
  },
  {
    title: 'Expires',
    getValue: () => {
      return (
        <Typography variant="body2">{tokenExpiresAt ? new Date(tokenExpiresAt).toLocaleString() : NO_VALUE}</Typography>
      );
    },
  },
];

const tokenRotationKeyExtractor = (item: SCIMConnection): string => item.connection_id;

const useMutateCancelTokenRotation = () => {
  const client = useStytchClient();
  const { mutate: mutateSWR } = useSWRConfig();

  return useMutateWithToast(async (connectionId: string) => {
    return await mutateSWR(
      scimGetConnectionKey(connectionId),
      async () => {
        const result = await client.scim.rotateCancel(connectionId);
        return result.connection;
      },
      {
        populateCache: true,
        revalidate: false,
      },
    );
  });
};

const ManageTokenRotation = ({ connection }: { connection: SCIMConnection }) => {
  const client = useStytchClient();
  const { mutate: mutateSWR } = useSWRConfig();
  const [isCancelAction, setIsCancelAction] = useState<boolean>();

  const bearerTokenField = getFieldBy({ idp: connection.identity_provider, key: 'bearer_token' });
  const bearerTokenFieldLabel = bearerTokenField?.label ?? DEFAULT_HEADER_BEARER_TOKEN_LABEL;

  const { mutate: cancelTokenRotation } = useMutateCancelTokenRotation();

  const { mutate: completeTokenRotation } = useMutateWithToast(async (connectionId: string) => {
    return await mutateSWR(
      scimGetConnectionKey(connectionId),
      async () => {
        const result = await client.scim.rotateComplete(connectionId);
        return result.connection;
      },
      {
        populateCache: true,
        revalidate: false,
      },
    );
  });

  const tokenRotationModalProps = useModalState(async () => {
    const connectionId = connection.connection_id;
    if (isCancelAction) {
      await cancelTokenRotation(connectionId);
    } else {
      await completeTokenRotation(connectionId);
    }

    return tokenRotationModalProps.close();
  });

  const {
    bearer_token_last_four: currentTokenLastFour,
    next_bearer_token_last_four: nextTokenLastFour,
    next_bearer_token_expires_at: nextTokenExpiresAt,
  } = connection;

  const nextTokenItemRenderers = tokenRotationItemRenderers({
    isCurrent: false,
    tokenTitle: bearerTokenFieldLabel,
    tokenLastFour: nextTokenLastFour,
    tokenExpiresAt: nextTokenExpiresAt,
  });

  const handleActionRotation = ({ isCancel }: { isCancel: boolean }) => {
    setIsCancelAction(isCancel);
    tokenRotationModalProps.open();
  };

  const warningText = isCancelAction
    ? `The token ${prependAsterisks(nextTokenLastFour!)} will be deactivated and no longer usable.`
    : `The token ${prependAsterisks(
        currentTokenLastFour,
      )} will be deactivated and no longer usable. It will be replaced with the token ${prependAsterisks(
        nextTokenLastFour!,
      )}.`;
  const confirmationText = isCancelAction
    ? 'Confirm that you are not using this token before continuing.'
    : `Make sure you are only using the token ${prependAsterisks(nextTokenLastFour!)} before completing rotation.`;

  return (
    <>
      <Table
        titleVariant="caption"
        itemRenderer={nextTokenItemRenderers}
        items={[connection]}
        rowKeyExtractor={tokenRotationKeyExtractor}
        disableBottomBorder={true}
      />
      <Modal
        {...tokenRotationModalProps}
        title={`${isCancelAction ? 'Cancel' : 'Complete'} token rotation?`}
        confirmButtonText={`${isCancelAction ? 'Cancel' : 'Complete'} rotation`}
        warning
      >
        <FlexBox flexDirection="column" gap={2}>
          <Typography>{warningText}</Typography>
          <Typography>{confirmationText}</Typography>
        </FlexBox>
      </Modal>
      <FlexBox flexDirection="row" gap={2}>
        <Button compact variant="ghost" onClick={() => handleActionRotation({ isCancel: true })} warning>
          Cancel rotation
        </Button>
        <Button compact variant="ghost" onClick={() => handleActionRotation({ isCancel: false })}>
          Complete rotation
        </Button>
      </FlexBox>
    </>
  );
};

const StartTokenRotation = ({
  connection,
  handleRotation,
}: {
  connection: SCIMConnection;
  handleRotation: (connection: SCIMConnectionWithNextBearerToken | undefined) => void;
}) => {
  const client = useStytchClient();
  const { mutate: mutateSWR } = useSWRConfig();

  const { mutate: startTokenRotation } = useMutateWithToast(async (connectionId: string) => {
    return await mutateSWR(
      scimGetConnectionKey(connectionId),
      async () => {
        const result = await client.scim.rotateStart(connectionId);

        return {
          ...result.connection,
          next_bearer_token_last_four: result.connection.next_bearer_token.slice(-4),
        };
      },
      {
        populateCache: true,
        revalidate: false,
      },
    );
  });

  const handleActionClick = () => {
    startTokenRotation(connection.connection_id).then((result) => {
      handleRotation(result);
    });
  };

  return (
    <>
      <Button compact variant="ghost" startIcon={<Add />} onClick={handleActionClick}>
        Start token rotation
      </Button>
    </>
  );
};

export const TokenRotationSection = ({ connection }: { connection: SCIMConnection }) => {
  const { data: canUpdateScim } = useRbac('stytch.scim', 'update');
  const canRotateToken = canUpdateScim ?? false;
  const { mutate: cancelTokenRotation } = useMutateCancelTokenRotation();

  const canStartTokenRotation = !connection.next_bearer_token_last_four;

  const bearerTokenField = getFieldBy({ idp: connection.identity_provider, key: 'bearer_token' });
  const bearerTokenFieldLabel = bearerTokenField?.label ?? DEFAULT_HEADER_BEARER_TOKEN_LABEL;
  const currentTokenItemRenderers = tokenRotationItemRenderers({
    isCurrent: true,
    tokenTitle: bearerTokenFieldLabel,
    tokenLastFour: connection.bearer_token_last_four,
    tokenExpiresAt: connection.bearer_token_expires_at,
  });

  const [hasUserConfirmedCopy, setHasUserConfirmedCopy] = useState(false);
  const [connectionWithNextToken, setConnectionWithNextToken] = useState<
    SCIMConnectionWithNextBearerToken | undefined
  >();

  const nextTokenField: Field<ConnectionWithNextBearerTokenKey> = {
    label: `Click to copy your new ${bearerTokenFieldLabel}`,
    scimConnectionKey: 'next_bearer_token',
    isCopyable: true,
  };

  const handleRotation = (connection: SCIMConnectionWithNextBearerToken | undefined) => {
    setConnectionWithNextToken(connection);
    open();
  };

  const handleClose = () => {
    cancelTokenRotation(connection.connection_id);
    close();
  };

  const { open, close, ...props } = useModalState(async () => {
    setHasUserConfirmedCopy(false);

    return close();
  });

  return (
    <FlexBox flexDirection="column" gap={2}>
      <Typography variant="body2">
        For security reasons, you may only view the last 4 digits of the token. If you have lost your token, create a
        replacement by starting a token rotation.
      </Typography>
      <Table
        titleVariant="caption"
        itemRenderer={currentTokenItemRenderers}
        items={[connection]}
        rowKeyExtractor={tokenRotationKeyExtractor}
        disableBottomBorder={true}
      />
      <Modal
        {...props}
        title="Start HTTP Header Bearer Token Rotation"
        confirmButtonText="Done"
        disableConfirm={!hasUserConfirmedCopy}
        close={handleClose}
        keepOpenOnConfirm
      >
        <FlexBox flexDirection="column" gap={2}>
          <Typography>
            You will not be able to see the full token again. Make sure to copy your token to your IdP.
          </Typography>
          {connectionWithNextToken && <SCIMFields fields={[nextTokenField]} connection={connectionWithNextToken} />}
          <Checkbox
            label="I have copied the token to my IdP."
            checked={hasUserConfirmedCopy}
            onClick={(value) => setHasUserConfirmedCopy(value)}
          />
        </FlexBox>
      </Modal>
      {canRotateToken &&
        (canStartTokenRotation ? (
          <StartTokenRotation connection={connection} handleRotation={handleRotation} />
        ) : (
          <ManageTokenRotation connection={connection} />
        ))}
    </FlexBox>
  );
};
