import { useStytchMember, useStytchOrganization, useStytchB2BClient } from '@stytch/react/b2b';
import {
  AdminPortalSSO,
  AdminPortalOrgSettings,
  AdminPortalMemberManagement,
  AdminPortalSCIM,
} from '@stytch/react/b2b/adminPortal';
import React, { useEffect, useState } from 'react';

const sections = {
  org: { label: 'Org', content: <AdminPortalOrgSettings /> },
  members: { label: 'Members', content: <AdminPortalMemberManagement /> },
  sso: { label: 'SSO', content: <AdminPortalSSO /> },
  scim: { label: 'SCIM', content: <AdminPortalSCIM /> },
};

const defaultSectionKey = 'scim';

const useKeepAlive = (keepAlive) => {
  const client = useStytchB2BClient();

  useEffect(() => {
    if (keepAlive) {
      const interval = setInterval(
        () => {
          client.session.authenticate({ session_duration_minutes: 60 }).catch((e) => {
            // eslint-disable-next-line no-console
            console.error('keep alive failed', e);
          });
        },
        1000 * 60 * 5,
      );

      return () => clearInterval(interval);
    }
  }, [client.session, keepAlive]);
};

const getSectionFromQueryString = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('section');
};

const getSectionUrl = (sectionKey) => {
  return `?section=${sectionKey}`;
};

const AdminPortal = () => {
  const [sectionKey, setSectionKey] = useState(() => getSectionFromQueryString() || defaultSectionKey);

  const pushSectionKey = (key) => {
    window.history.pushState({}, '', getSectionUrl(key));
    return setSectionKey(key);
  };

  useEffect(() => {
    const section = getSectionFromQueryString();

    if (section) {
      setSectionKey(section);
    } else {
      pushSectionKey(defaultSectionKey);
    }
  }, []);

  const [keepAlive, setKeepAlive] = useState(true);
  useKeepAlive(keepAlive);

  const { member } = useStytchMember();
  const { organization } = useStytchOrganization();

  return (
    <div>
      <h2>Admin Portal Demo</h2>
      <p>
        {member ? (
          <>
            Logged in: {member.email_address} ({organization?.organization_name})
          </>
        ) : (
          <>Not logged in</>
        )}
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            checked={keepAlive}
            onChange={(e) => {
              setKeepAlive(e.target.checked);
            }}
          />{' '}
          Keep session alive
        </label>
      </p>
      <nav>
        <ul style={{ listStyle: 'none', display: 'flex', margin: 0, padding: 0, borderBottom: '1px solid black' }}>
          {Object.entries(sections).map(([key, { label }]) => (
            <li key={key}>
              <a
                href={getSectionUrl(key)}
                style={{
                  all: 'unset',
                  display: 'block',
                  borderBottom: '4px solid',
                  borderBottomColor: key === sectionKey ? 'black' : 'transparent',
                  padding: '0 24px',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    pushSectionKey(key);
                  }
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div style={{ margin: 16 }}>{sections[sectionKey].content}</div>
    </div>
  );
};

export default AdminPortal;
