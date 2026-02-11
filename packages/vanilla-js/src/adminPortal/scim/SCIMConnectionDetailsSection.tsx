import React, { useMemo } from 'react';
import { FlexBox } from '../components/FlexBox';
import { SCIMConnection } from '@stytch/core/public';
import { DEFAULT_BASE_URL_LABEL, Field, SCIMIdpInfo, getFieldBy, getSCIMIdpInfo } from './scimInfo';
import { SCIMFields } from '../components/ScimFields';

export const DetailsSection = ({ connection }: { connection: SCIMConnection }) => {
  const { displayName }: SCIMIdpInfo = getSCIMIdpInfo(connection.identity_provider);

  const detailsFields: Field<'base_url' | 'display_name'>[] = useMemo(() => {
    const baseUrlField = getFieldBy({ idp: connection.identity_provider, key: 'base_url' }) ?? {
      label: DEFAULT_BASE_URL_LABEL,
      value: connection.base_url,
      isCopyable: true,
    };

    return [
      {
        label: 'SCIM Connection Display Name',
        scimConnectionKey: 'display_name',
      },
      {
        label: 'IdP',
        value: displayName,
      },
      baseUrlField,
    ];
  }, [connection.base_url, connection.identity_provider, displayName]);

  return (
    <FlexBox flexDirection="column" gap={2}>
      <SCIMFields connection={connection} fields={detailsFields} />
    </FlexBox>
  );
};
