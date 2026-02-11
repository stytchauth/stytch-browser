import { Organization } from '@stytch/core/public';
import classNames from 'classnames';
import React from 'react';

import { buttonClassNames } from '../../components/atoms/Button';
import VerticalTransition, { hoverTriggerClass } from '../../components/atoms/VerticalTransition';
import { Badge } from '../../components/molecules/Badge';
import styles from './OrganizationRow.module.css';

export type OrganizationRowProps = {
  organization: Organization;
  action?: string;
  onClick: () => void;
};

const Arrow = () => (
  <svg
    className={styles.arrow}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.707 10L10.3535 14.3545L9.64648 13.6475L12.793 10.5H6V9.5H12.793L9.64648 6.35352L10.3535 5.64648L14.707 10Z"
      fill="currentColor"
    />
  </svg>
);

const OrganizationRow = ({ organization, action, onClick }: OrganizationRowProps) => {
  const { organization_name, organization_logo_url } = organization;

  const logo = organization_logo_url ? (
    <img className={styles.logo} src={organization_logo_url} alt="" />
  ) : (
    <div className={styles.logo} role="presentation">
      {
        // The Array.from() accounts for two byte Unicode characters
        Array.from(organization_name)[0]
      }
    </div>
  );

  return (
    <button
      className={classNames(
        styles.organizationRow,
        hoverTriggerClass,
        buttonClassNames({
          variant: 'outline',
          // Not a block even though it looks like it to avoid the inheriting the centering style
        }),
      )}
      onClick={onClick}
    >
      <div className={styles.left}>
        {logo}
        <div className={styles.nameText}>{organization_name}</div>
      </div>

      <VerticalTransition
        trigger="hover"
        rootClassName={styles.right}
        className={styles.rightContent}
        primary={action && <Badge>{action}</Badge>}
        secondary={<Arrow />}
      />
    </button>
  );
};

export default OrganizationRow;
