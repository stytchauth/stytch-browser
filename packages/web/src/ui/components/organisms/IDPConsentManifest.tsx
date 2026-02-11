import { useLingui } from '@lingui/react/macro';
import { IDPConsentItem, IDPConsentScreenManifest, IDPConsentSection } from '@stytch/core/public';
import classNames from 'classnames';
import React, { MouseEvent } from 'react';

import { Chevron } from '../../../assets';
import { getTransitionDuration } from '../atoms/animation';
import Column from '../atoms/Column';
import Typography from '../atoms/Typography';
import styles from './IDPConsentManifest.module.css';

const Item = ({ item, as = 'li' }: { item: IDPConsentItem; as?: 'li' | 'div' }) => {
  if (typeof item === 'string') {
    item = { text: item };
  }

  const summary = <Typography variant="helper">{item.text}</Typography>;
  const Element = as;

  if (!item.details?.length) {
    return <Element className={classNames(styles.summaryNoDetail, styles.borderBetween)}>{summary}</Element>;
  }

  return (
    <Element className={styles.borderBetween}>
      <details className={styles.details}>
        <summary onClick={animateToggleDetail}>
          {summary}
          <Chevron className={styles.chevron} role="presentation" />
        </summary>

        <ul className={styles.nestedList}>
          {item.details?.map((details) => (
            <Typography as="li" variant="helper" key={details}>
              {details}
            </Typography>
          ))}
        </ul>
      </details>
    </Element>
  );
};

const Section = ({ section }: { section: IDPConsentSection }) => (
  <Column gap={2}>
    <Typography weight="medium">{section.header}</Typography>

    <ul className={styles.outerList}>
      {section.items.map((item: IDPConsentItem, i) => (
        <Item key={i} item={item} />
      ))}
    </ul>
  </Column>
);

export const ConsentManifest = ({
  manifest,
  clientName,
}: {
  manifest: IDPConsentScreenManifest;
  clientName: string;
}) => {
  const { t } = useLingui();
  const sections =
    typeof manifest[0] === 'object' && 'header' in manifest[0]
      ? (manifest as IDPConsentSection[])
      : [
          {
            header: t({
              id: 'idpConsent.allowClientTo',
              message: `Allow ${clientName} to:`,
            }),
            items: manifest as IDPConsentItem[],
          },
        ];

  return (
    <div className={styles.manifest}>
      {sections.map((item, i) => (
        <Section key={i} section={item} />
      ))}
    </div>
  );
};

export const UngrantableScopes = ({
  clientName,
  ungrantableScopeDescriptions,
}: {
  clientName: string;
  ungrantableScopeDescriptions: string[];
}) => {
  const { t } = useLingui();
  if (!ungrantableScopeDescriptions.length) return null;

  // Map it to a consent item so we can reuse <Item>
  const item: IDPConsentItem = {
    text: t({
      id: 'idpConsent.noPermissionsToGrant',
      message: `You do not have permissions to grant ${clientName} access to some of the requested scopes.`,
    }),
    details: ungrantableScopeDescriptions,
  };

  return (
    <div className={styles.ungrantable}>
      <Item item={item} as="div" />
    </div>
  );
};

function animateToggleDetail(evt: MouseEvent<HTMLElement>) {
  const parent = evt.currentTarget.parentElement;
  if (parent?.tagName !== 'DETAILS') return;
  const detail = parent as HTMLDetailsElement;
  evt.preventDefault();

  const wasOpen = detail.open;
  const summaryHeight = evt.currentTarget.clientHeight + 'px';
  const detailStyles = getComputedStyle(detail);
  const closedHeight = `calc(${summaryHeight} + ${detailStyles.paddingTop} + ${detailStyles.paddingBottom})`;
  const animationOptions = {
    duration: getTransitionDuration(evt.currentTarget),
    easing: 'ease-in-out',
  };

  if (wasOpen) {
    const detailHeight = detail.clientHeight + 'px';
    const animation = detail.animate([{ height: detailHeight }, { height: closedHeight }], animationOptions);

    // Need to delay open being changed, otherwise the content will disappear immediately
    // while the animation is still running
    animation.finished.then(() => {
      detail.open = false;
    });
  } else {
    detail.open = true;
    requestAnimationFrame(() => {
      const detailHeight = detail.clientHeight + 'px';
      detail.animate([{ height: closedHeight }, { height: detailHeight }], animationOptions);
    });
  }
}
