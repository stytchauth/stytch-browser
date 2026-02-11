import styled from 'styled-components';
import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Text } from './Text';
import { IDPConsentItem, IDPConsentSection, IDPConsentScreenManifest } from '@stytch/core/public';

const ScopeList = styled.ul`
  padding: 0;
`;

const ScopeListItem = styled.li`
  padding: 4px;
  box-sizing: border-box;
  position: relative;
  list-style: none;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  }
`;

interface ItemSummaryProps {
  expandable: boolean;
}

const ItemSummary = styled.summary<ItemSummaryProps>`
  list-style: none;
  display: flex;
  justify-content: space-between;
  cursor: ${(props) => (props.expandable ? 'pointer' : 'default')};
`;

const DropdownArrowSvg = styled.svg`
  width: 32px;
  height: 32px;
  margin-left: 10px;
  margin-top: -5px;
  vertical-align: top;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  details[open] & {
    transform: rotate(90deg);
  }
`;

const ItemNestedDetailsList = styled.ul`
  padding: 4px 24px;
  list-style: none;
`;

const DropdownArrow = () => (
  <DropdownArrowSvg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.5875 11L13.4125 12.175L17.2291 16L13.4125 19.825L14.5875 21L19.5875 16L14.5875 11Z"
      fill="currentColor"
    />
  </DropdownArrowSvg>
);

const Item = ({ item }: { item: IDPConsentItem }) => {
  if (typeof item === 'string') {
    item = { text: item };
  }

  return (
    <ScopeListItem>
      <details>
        <ItemSummary expandable={!!item.details?.length}>
          <Text size="helper">•&nbsp;{item.text}</Text>
          {item.details?.length && <DropdownArrow />}
        </ItemSummary>
        {item.details?.length && (
          <ItemNestedDetailsList>
            {item.details?.map((details) => (
              <li key={details}>
                <Text size="helper" color="secondary">
                  •&nbsp;{details}
                </Text>
              </li>
            ))}
          </ItemNestedDetailsList>
        )}
      </details>
    </ScopeListItem>
  );
};

const SectionHeader = styled(Text)`
  font-weight: 600;
`;

const Section = ({ section }: { section: IDPConsentSection }) => (
  <div>
    <SectionHeader size="body">{section.header}</SectionHeader>
    <ScopeList>
      {section.items.map((item: IDPConsentItem, i) => (
        <Item key={i} item={item} />
      ))}
    </ScopeList>
  </div>
);

export const ConsentManifest = ({
  manifest,
  clientName,
}: {
  manifest: IDPConsentScreenManifest;
  clientName: string;
}) => {
  const { t } = useLingui();
  if (typeof manifest[0] === 'object' && 'header' in manifest[0]) {
    return (
      <div>
        {(manifest as IDPConsentSection[]).map((item, i) => (
          <Section key={i} section={item} />
        ))}
      </div>
    );
  }
  return (
    <Section
      section={{
        header: t({
          id: 'idpConsent.allowClientTo',
          message: `Allow ${clientName} to:`,
        }),
        items: manifest as IDPConsentItem[],
      }}
    />
  );
};

const UngrantableSection = styled.details`
  border: ${({ theme }) => theme.container.border};
  border-radius: ${({ theme }) => theme.container.borderRadius};
  padding: 16px;
  margin-bottom: 36px;
`;

const UngrantableSummary = styled.summary`
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  details[open] > & {
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  }
`;

const UngrantableNestedDetailsList = styled.ul`
  padding: 4px;
  margin: 0;
  list-style: none;
`;

export const UngrantableScopes = ({
  clientName,
  ungrantableScopeDescriptions,
}: {
  clientName: string;
  ungrantableScopeDescriptions: string[];
}) => {
  const { t } = useLingui();
  if (!ungrantableScopeDescriptions.length) return null;
  return (
    <UngrantableSection>
      <UngrantableSummary>
        <Text size="helper">
          {t({
            id: 'idpConsent.noPermissionsToGrant',
            message: `You do not have permissions to grant ${clientName} access to some of the requested scopes.`,
          })}
        </Text>
        <DropdownArrow />
      </UngrantableSummary>

      <Text size="helper" color="secondary">
        {t({
          id: 'idpConsent.cannotGrantRequest',
          message: `You cannot grant ${clientName}'s request to:`,
        })}
      </Text>

      <UngrantableNestedDetailsList>
        {ungrantableScopeDescriptions.map((desc, i) => (
          <li key={i}>
            <Text size="helper" color="secondary">
              •&nbsp;{desc}
            </Text>
          </li>
        ))}
      </UngrantableNestedDetailsList>
    </UngrantableSection>
  );
};
