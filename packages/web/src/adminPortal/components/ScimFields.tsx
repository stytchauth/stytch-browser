import React from 'react';

import { Field } from '../scim/scimInfo';
import { CopyableText } from './CopyableText';
import { FlexBox } from './FlexBox';
import { Typography } from './Typography';

export const SCIMFields = <T extends string>({
  fields,
  connection,
}: {
  fields: Field<T>[] | undefined;
  connection: Record<T, string>;
}) => {
  return (
    <>
      {fields?.map((field, index) => {
        const label = field.label;
        const value = 'value' in field ? field.value : connection[field.scimConnectionKey];

        return (
          <FlexBox gap={0.5} flexDirection="column" key={index}>
            <Typography variant="body2" color="secondary">
              {label}
            </Typography>
            {field.isCopyable ? <CopyableText>{value}</CopyableText> : <Typography variant="body2">{value}</Typography>}
          </FlexBox>
        );
      })}
    </>
  );
};
