import React, { useRef, useState } from 'react';
import { useStytchB2BClient, useStytchMember, useStytchOrganization } from '@stytch/react/b2b';
import { Results } from './Results';
import { useTimer } from './timer';

const Button = ({ name, onClick, glowing }) => (
  <button name={name} className={glowing ? 'glower' : ''} onClick={onClick}>
    <code>{name}</code>
  </button>
);

const formDataToJSON = (formData) => {
  const coerceEmptyStr = (input) => (input && input !== '' ? input : undefined);
  const res = {};
  for (let [k, v] of Array.from(formData.entries())) {
    res[k] = coerceEmptyStr(v);
  }
  return res;
};

const parseArrayStr = (str) => {
  if (str === '' || str === undefined) {
    return undefined;
  }
  return str.split(',').map((item) => item.trim());
};

const parseConstantValue = (data, name) => {
  const val = data.get(name);
  if (val === '') {
    return undefined;
  }
  return val;
};

const getCallbackURL = () => {
  return window.location.href.split('?')[0];
};

const Section = ({ children, title }) => {
  const key = `workbench_section::${title}`;
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(key) === 'true');
  const onClick = (e) => {
    e.preventDefault();
    setIsOpen((isOpen) => {
      localStorage.setItem(key, !isOpen);
      return !isOpen;
    });
  };
  return (
    <details open={isOpen}>
      <summary onClick={onClick}>{title}</summary>
      {children}
    </details>
  );
};
//
// Schema looks like
// [
//   { name: 'name', kind: 'string' },
//   { name: 'create_member_as_pending', kind: 'boolean' },
//   { name: 'favorite_color', kind: 'select', values ['red', 'green', 'grey'] }
// ]
const WorkbenchForm = ({ schema, methodName, onSubmit }) => {
  const children = [];

  for (let attr of schema) {
    const { name, kind, values } = attr;

    const labelText = name
      .split('_')
      .map((tok) => tok.substr(0, 1).toLocaleUpperCase() + tok.substr(1))
      .join(' ');

    children.push(
      <label key={`label-${name}`} htmlFor={name}>
        {labelText}:{' '}
      </label>,
    );

    if (kind === 'string') {
      children.push(<input key={`input-${name}`} type="text" id={name} name={name} />);
    } else if (kind === 'boolean') {
      children.push(<input key={`input-${name}`} type="checkbox" id={name} name={name} />);
    } else if (kind === 'number') {
      children.push(<input key={`input-${name}`} type="number" id={name} name={name} />);
    } else if (kind === 'json') {
      children.push(<textarea key={`input-${name}`} id={name} name={name} />);
    } else if (kind === 'select') {
      children.push(
        <select key={`input-${name}`} name={name} id={name}>
          <option value="">Unset</option>
          {values.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>,
      );
    } else {
      throw Error('I do not know how to render this thing you gave me');
    }
    children.push(<br key={`br-${name}`} />);
  }

  const doSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const req = formDataToJSON(data);

    for (let attr of schema.filter((attr) => !!req[attr.name])) {
      // Convert all checkboxes from 'on'/'off' to true/false
      if (attr.kind === 'boolean') {
        req[attr.name] = req[attr.name] === 'on';
      }

      // convert '1234' to 1234
      if (attr.kind === 'number') {
        req[attr.name] = parseInt(req[attr.name]);
      }

      // Convert all JSON to actual objects
      if (attr.kind === 'json') {
        req[attr.name] = JSON.parse(req[attr.name]);
      }

      // Convert 'foo,bar' to ['foo', 'bar']
      if (attr.is_csv) {
        req[attr.name] = parseArrayStr(req[attr.name]);
      }
    }

    onSubmit(req);
  };

  return (
    <div className="workbenchForm">
      <form onSubmit={doSubmit}>
        <div>{children}</div>
        <Button name={methodName} type="submit" />
      </form>
    </div>
  );
};

const Sessions = ({ dispatch }) => {
  const orgIDRefForSessionExchange = useRef();

  const sessionGetSync = () => {
    dispatch(stytch.session.getSync());
  };

  const sessionGetTokens = () => {
    dispatch(stytch.session.getTokens());
  };
  const sessionAuthenticate = () => {
    return dispatch(stytch.session.authenticate());
  };
  const sessionRevoke = () => {
    return dispatch(stytch.session.revoke());
  };
  const sessionRevokeForMember = ({ member_id }) => {
    return dispatch(stytch.session.revokeForMember({ member_id }));
  };
  const updateSession = ({ session_token, session_jwt }) => {
    stytch.session.updateSession({
      session_token: session_token,
      session_jwt: session_jwt || null,
    });
    return dispatch(stytch.session.authenticate());
  };
  const sessionExchange = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const org_id = orgIDRefForSessionExchange.current.value;
    const locale = parseConstantValue(data, 'locale');
    return dispatch(stytch.session.exchange({ organization_id: org_id, session_duration_minutes: 60, locale: locale }));
  };
  const sessionAttest = (data) => {
    return dispatch(stytch.session.attest(data));
  };
  return (
    <Section title="Sessions">
      <Button name="stytch.session.getSync()" onClick={sessionGetSync} />
      <br />
      <Button name="stytch.session.getTokens()" onClick={sessionGetTokens} />
      <br />
      <Button name="stytch.session.authenticate()" onClick={sessionAuthenticate} />
      <br />
      <Button name="stytch.session.revoke()" onClick={sessionRevoke} />
      <br />
      <WorkbenchForm
        schema={[{ name: 'member_id', kind: 'string' }]}
        onSubmit={sessionRevokeForMember}
        methodName="stytch.session.revokeForMember()"
      />
      <WorkbenchForm
        schema={[
          { name: 'session_token', kind: 'string' },
          { name: 'session_jwt', kind: 'string' },
        ]}
        onSubmit={updateSession}
        methodName="stytch.session.updateSession()"
      />
      <form className="workbenchForm" onSubmit={sessionExchange}>
        <div>
          <label htmlFor="email">Organization ID:</label>
          <input type="text" id="org_id" name="org_id" ref={orgIDRefForSessionExchange} required />
        </div>
        <label htmlFor="email">Locale: </label>
        <select name="locale" id="locale">
          <option value="">Unset</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="pt-br">Brazilian Portuguese</option>
        </select>
        <br />
        <Button name="stytch.session.exchange" type="submit" />
        <br />
      </form>
      <WorkbenchForm
        schema={[{ name: 'access_token', kind: 'string' }]}
        onSubmit={(opts) => dispatch(stytch.session.exchangeAccessToken({ ...opts, session_duration_minutes: 60 }))}
        methodName="stytch.session.exchangeAccessToken()"
      />
      <WorkbenchForm
        schema={[
          { name: 'organization_id', kind: 'string' },
          { name: 'profile_id', kind: 'string' },
          { name: 'token', kind: 'string' },
          { name: 'session_token', kind: 'string' },
          { name: 'session_jwt', kind: 'string' },
        ]}
        onSubmit={sessionAttest}
        methodName="stytch.session.attest()"
      />
    </Section>
  );
};

const Self = ({ dispatch }) => {
  const { member: stytchMember } = useStytchMember();

  const nameRefForMemberUpdate = useRef();
  const phoneNumberRefForMemberUpdate = useRef();

  const memberGetSync = () => {
    dispatch(stytch.self.getSync());
  };
  const memberGet = () => {
    return dispatch(stytch.self.get());
  };

  const memberUpdate = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    let name = nameRefForMemberUpdate.current.value;
    if (name.trim() === '') {
      name = undefined;
    }
    const mfaEnrolledValue = parseConstantValue(data, 'mfa-enrolled');
    let mfaEnrolled = undefined;
    if (mfaEnrolledValue === 'true') {
      mfaEnrolled = true;
    } else if (mfaEnrolledValue === 'false') {
      mfaEnrolled = false;
    }
    let phoneNumber = phoneNumberRefForMemberUpdate.current.value;
    if (phoneNumber.trim() === '') {
      phoneNumber = undefined;
    }
    let defaultMfaMethod = parseConstantValue(data, 'default-mfa-method');
    if (defaultMfaMethod === '') {
      defaultMfaMethod = undefined;
    }
    return dispatch(
      stytch.self.update({
        name: name,
        mfa_phone_number: phoneNumber,
        mfa_enrolled: mfaEnrolled,
        default_mfa_method: defaultMfaMethod,
      }),
    );
  };

  const memberMFAPhoneNumberDelete = () => {
    return dispatch(stytch.self.deleteMFAPhoneNumber());
  };

  const memberTOTPDelete = () => {
    return dispatch(stytch.self.deleteMFATOTP());
  };

  const memberUnlinkRetiredEmail = ({ retired_email_id, retired_email_address }) =>
    dispatch(
      stytch.self.unlinkRetiredEmail({
        email_id: retired_email_id,
        email_address: retired_email_address,
      }),
    );

  const memberStartEmailUpdate = ({ email_address, login_redirect_url, login_template_id, locale, delivery_method }) =>
    dispatch(
      stytch.self.startEmailUpdate({ email_address, login_redirect_url, login_template_id, locale, delivery_method }),
    );

  const memberGetConnectedApps = () => dispatch(stytch.self.getConnectedApps());

  const memberRevokeConnectedApp = ({ connected_app_id }) =>
    dispatch(stytch.self.revokeConnectedApp({ connected_app_id }));

  const memberFactorControls = [<br key="factor-brk" />];
  if (stytchMember) {
    if (stytchMember.member_password_id) {
      const onClick = () => {
        dispatch(stytch.self.deletePassword(stytchMember.member_password_id));
      };
      memberFactorControls.push(
        <Button key={`btn-${stytchMember.member_password_id}`} name="Delete password" onClick={onClick} />,
        <br key={`brk-${stytchMember.member_password_id}`} />,
      );
    }
  }

  return (
    <Section title="Self">
      <Button name="stytch.self.getSync()" onClick={memberGetSync} /> <br />
      <Button name="stytch.self.get()" onClick={memberGet} /> <br />
      <form onSubmit={memberUpdate}>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" ref={nameRefForMemberUpdate} />
          <br />
          <label htmlFor="phone-number">Phone Number:</label>
          <input type="text" id="phone_number" name="phone_number" ref={phoneNumberRefForMemberUpdate} />
          <br />
          <label htmlFor="mfaEnrolled">MFA Enrolled: </label>
          <select name="mfa-enrolled" id="mfa-enrolled">
            <option value="">Unset</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
          <br />
          <label htmlFor="default-mfa-method">Default MFA Method: </label>
          <select name="default-mfa-method" id="default-mfa-method">
            <option value="">Unset</option>
            <option value="sms_otp">sms_otp</option>
            <option value="totp">totp</option>
          </select>
          <br />
        </div>
        <Button name="stytch.self.update" type="submit" />
        <br />
      </form>
      <Button name="stytch.self.deleteMFATOTP()" onClick={memberTOTPDelete} /> <br />
      <Button name="stytch.self.deleteMFAPhoneNumber()" onClick={memberMFAPhoneNumberDelete} /> <br />
      <WorkbenchForm
        schema={[
          { name: 'retired_email_id', kind: 'string' },
          { name: 'retired_email_address', kind: 'string' },
        ]}
        onSubmit={memberUnlinkRetiredEmail}
        methodName={'stytch.self.unlinkRetiredEmail()'}
      />
      <WorkbenchForm
        schema={[
          { name: 'email_address', kind: 'string' },
          { name: 'login_redirect_url', kind: 'string' },
          { name: 'login_template_id', kind: 'string' },
          { name: 'locale', kind: 'select', values: ['en', 'es', 'pt-br'] },
          { name: 'delivery_method', kind: 'select', values: ['EMAIL_MAGIC_LINK', 'EMAIL_OTP'] },
        ]}
        onSubmit={memberStartEmailUpdate}
        methodName={'stytch.self.startEmailUpdate()'}
      />
      <WorkbenchForm schema={[]} onSubmit={memberGetConnectedApps} methodName={'stytch.self.getConnectedApps()'} />
      <WorkbenchForm
        schema={[{ name: 'connected_app_id', kind: 'string' }]}
        onSubmit={memberRevokeConnectedApp}
        methodName={'stytch.self.revokeConnectedApp()'}
      />
      {memberFactorControls.length > 1 ? <strong>Attached Factors</strong> : null}
      {memberFactorControls}
    </Section>
  );
};

const Organization = ({ dispatch }) => {
  const organizationGetSync = () => {
    dispatch(stytch.organization.getSync());
  };

  const organizationGet = () => {
    return dispatch(stytch.organization.get());
  };

  const organizationDelete = () => {
    return dispatch(stytch.organization.delete());
  };

  return (
    <Section title="Organization">
      <Button name="stytch.organization.getSync()" onClick={organizationGetSync} /> <br />
      <Button name="stytch.organization.get()" onClick={organizationGet} /> <br />
      <WorkbenchForm
        schema={[
          { name: 'organization_name', kind: 'string' },
          { name: 'organization_slug', kind: 'string' },
          { name: 'organization_logo_url', kind: 'string' },
          { name: 'sso_jit_provisioning', kind: 'select', values: ['ALL_ALLOWED', 'RESTRICTED', 'NOT_ALLOWED'] },
          { name: 'email_allowed_domains', kind: 'string', is_csv: true },
          { name: 'email_jit_provisioning', kind: 'select', values: ['RESTRICTED', 'NOT_ALLOWED'] },
          { name: 'email_invites', kind: 'select', values: ['ALL_ALLOWED', 'RESTRICTED', 'NOT_ALLOWED'] },
          { name: 'oauth_tenant_jit_provisioning', kind: 'select', values: ['RESTRICTED', 'NOT_ALLOWED'] },
          { name: 'allowed_oauth_tenants', kind: 'json' },
          { name: 'auth_methods', kind: 'select', values: ['ALL_ALLOWED', 'RESTRICTED'] },
          { name: 'allowed_auth_methods', kind: 'string', is_csv: true },
          { name: 'mfa_methods', kind: 'select', values: ['ALL_ALLOWED', 'RESTRICTED'] },
          { name: 'allowed_mfa_methods', kind: 'string', is_csv: true },
          { name: 'mfa_policy', kind: 'select', values: ['OPTIONAL', 'REQUIRED_FOR_ALL'] },
          {
            name: 'first_party_connected_apps_allowed_type',
            kind: 'select',
            values: ['ALL_ALLOWED', 'RESTRICTED', 'NOT_ALLOWED'],
          },
          { name: 'allowed_first_party_connected_apps', kind: 'json' },
          {
            name: 'third_party_connected_apps_allowed_type',
            kind: 'select',
            values: ['ALL_ALLOWED', 'RESTRICTED', 'NOT_ALLOWED'],
          },
          { name: 'allowed_third_party_connected_apps', kind: 'json' },
        ]}
        onSubmit={(req) => dispatch(stytch.organization.update(req))}
        methodName="stytch.organization.update()"
      />
      <Button name="stytch.organization.delete()" onClick={organizationDelete} />
      <WorkbenchForm
        schema={[{ name: 'organization_slug', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.organization.getBySlug(req))}
        methodName="stytch.organization.getBySlug()"
      />
      <WorkbenchForm
        schema={[]}
        onSubmit={() => dispatch(stytch.organization.getConnectedApps())}
        methodName="stytch.organization.getConnectedApps()"
      />
      <WorkbenchForm
        schema={[{ name: 'connected_app_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.organization.getConnectedApp(req))}
        methodName="stytch.organization.getConnectedApp()"
      />
    </Section>
  );
};

const OrganizationMembers = ({ dispatch }) => {
  return (
    <Section title="Organization Members">
      <WorkbenchForm
        schema={[
          { name: 'email_address', kind: 'string' },
          { name: 'name', kind: 'string' },
          { name: 'create_member_as_pending', kind: 'boolean' },
          { name: 'is_breakglass', kind: 'boolean' },
          { name: 'mfa_phone_number', kind: 'string' },
          { name: 'mfa_enrolled', kind: 'boolean' },
          { name: 'roles', kind: 'string', is_csv: true },
        ]}
        onSubmit={(req) => dispatch(stytch.organization.members.create(req))}
        methodName="stytch.organization.members.create()"
      />
      <WorkbenchForm
        schema={[
          { name: 'cursor', kind: 'string' },
          { name: 'limit', kind: 'number' },
          { name: 'filter_name', kind: 'select', values: ['member_ids', 'member_emails', 'member_phone_numbers'] },
          { name: 'filter_value', kind: 'string', is_csv: true },
          { name: 'raw_query', kind: 'json' },
        ]}
        onSubmit={(req) => {
          let query = undefined;
          if (req.raw_query) {
            query = req.raw_query;
          } else if (req.filter_name) {
            query = { operator: 'AND', operands: [{ filter_name: req.filter_name, filter_value: req.filter_value }] };
          }
          dispatch(
            stytch.organization.members.search({
              cursor: req.cursor,
              limit: req.limit,
              query,
            }),
          );
        }}
        methodName="stytch.organization.members.search()"
      />
      <WorkbenchForm
        schema={[
          { name: 'member_id', kind: 'string' },
          { name: 'email_address', kind: 'string' },
          { name: 'unlink_email', kind: 'boolean' },
          { name: 'name', kind: 'string' },
          { name: 'untrusted_metadata', kind: 'json' },
          { name: 'is_breakglass', kind: 'boolean' },
          { name: 'mfa_phone_number', kind: 'string' },
          { name: 'mfa_enrolled', kind: 'boolean' },
          { name: 'roles', kind: 'string', is_csv: true },
          { name: 'preserve_existing_sessions', kind: 'boolean' },
          { name: 'default_mfa_method', kind: 'select', values: ['totp', 'sms_otp'] },
        ]}
        onSubmit={(req) => dispatch(stytch.organization.members.update(req))}
        methodName="stytch.organization.members.update()"
      />
      <WorkbenchForm
        schema={[{ name: 'member_password_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.organization.members.deletePassword(req.member_password_id))}
        methodName="stytch.organization.members.deletePassword()"
      />
      <WorkbenchForm
        schema={[{ name: 'member_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.organization.members.deleteMFATOTP(req.member_id))}
        methodName="stytch.organization.members.deleteMFATOTP()"
      />
      <WorkbenchForm
        schema={[{ name: 'member_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.organization.members.deleteMFAPhoneNumber(req.member_id))}
        methodName="stytch.organization.members.deleteMFAPhoneNumber()"
      />
      <WorkbenchForm
        schema={[{ name: 'member_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.organization.members.delete(req.member_id))}
        methodName="stytch.organization.members.delete()"
      />
      <WorkbenchForm
        schema={[{ name: 'member_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.organization.members.reactivate(req.member_id))}
        methodName="stytch.organization.members.reactivate()"
      />
      <WorkbenchForm
        schema={[
          { name: 'member_id', kind: 'string' },
          { name: 'email_id', kind: 'string' },
          { name: 'email_address', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.organization.members.unlinkRetiredEmail(req))}
        methodName="stytch.organization.members.unlinkRetiredEmail()"
      />
      <WorkbenchForm
        schema={[
          { name: 'member_id', kind: 'string' },
          { name: 'email_address', kind: 'string' },
          { name: 'login_redirect_url', kind: 'string' },
          { name: 'login_template_id', kind: 'string' },
          { name: 'locale', kind: 'select', values: ['en', 'es', 'pt-br'] },
          { name: 'delivery_method', kind: 'select', values: ['EMAIL_MAGIC_LINK', 'EMAIL_OTP'] },
        ]}
        onSubmit={(req) => dispatch(stytch.organization.members.startEmailUpdate(req))}
        methodName="stytch.organization.members.startEmailUpdate()"
      />
      <WorkbenchForm
        schema={[{ name: 'member_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.organization.members.getConnectedApps(req))}
        methodName="stytch.organization.members.getConnectedApps()"
      />
      <WorkbenchForm
        schema={[
          { name: 'member_id', kind: 'string' },
          { name: 'connected_app_id', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.organization.members.revokeConnectedApp(req))}
        methodName="stytch.organization.members.revokeConnectedApp()"
      />
    </Section>
  );
};

const MagicLinks = ({ hasDiscovery, hasEml, chompToken, dispatch }) => {
  const magicLinksAuthenticate = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const token = chompToken();
    if (!token) {
      return;
    }
    const locale = parseConstantValue(data, 'locale');
    return dispatch(
      stytch.magicLinks.authenticate({ magic_links_token: token, session_duration_minutes: 60, locale: locale }),
    );
  };

  return (
    <Section title="Magic Links">
      <WorkbenchForm
        schema={[
          { name: 'email_address', kind: 'string' },
          { name: 'organization_id', kind: 'string' },
          { name: 'locale', kind: 'select', values: ['en', 'es', 'pt-br'] },
          { name: 'login_expiration_minutes', kind: 'number' },
          { name: 'signup_expiration_minutes', kind: 'number' },
        ]}
        methodName="stytch.magicLinks.email.loginOrSignup()"
        onSubmit={(req) =>
          dispatch(
            stytch.magicLinks.email.loginOrSignup({
              ...req,
              login_redirect_url: getCallbackURL(),
              signup_redirect_url: getCallbackURL(),
            }),
          )
        }
      />
      <WorkbenchForm
        schema={[
          { name: 'email_address', kind: 'string' },
          { name: 'name', kind: 'string' },
          { name: 'locale', kind: 'select', values: ['en', 'es', 'pt-br'] },
          { name: 'roles', kind: 'string', is_csv: true },
          { name: 'invite_expiration_minutes', kind: 'number' },
        ]}
        methodName="stytch.magicLinks.email.invite()"
        onSubmit={(req) =>
          dispatch(
            stytch.magicLinks.email.invite({
              ...req,
              invite_redirect_url: getCallbackURL(),
            }),
          )
        }
      />
      <form onSubmit={magicLinksAuthenticate}>
        <div>
          <label htmlFor="email">Locale: </label>
          <select name="locale" id="locale">
            <option value="">Unset</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="pt-br">Brazilian Portuguese</option>
          </select>
          <br />
        </div>
        <Button name="stytch.magicLinks.authenticate()" type="submit" glowing={!hasDiscovery && hasEml} />
        <br />
      </form>
    </Section>
  );
};

const DiscoveryMagicLinks = ({ hasDiscovery, chompToken, dispatch, hasOauth, hasPasswords }) => {
  const discoveryEMLEmailRef = useRef();
  const discoveryEMLExpirationRef = useRef();
  const magicLinksDiscoverySend = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const email_address = discoveryEMLEmailRef.current.value;
    const locale = parseConstantValue(data, 'locale');
    const expiration = discoveryEMLExpirationRef.current.value
      ? parseInt(discoveryEMLExpirationRef.current.value, 10)
      : undefined;
    return dispatch(
      stytch.magicLinks.email.discovery.send({
        email_address,
        discovery_redirect_url: getCallbackURL(),
        locale: locale,
        discovery_expiration_minutes: expiration,
      }),
    );
  };

  const magicLinksDiscoveryAuthenticate = async () => {
    const token = chompToken();
    if (!token) {
      return;
    }
    return dispatch(stytch.magicLinks.discovery.authenticate({ discovery_magic_links_token: token }));
  };

  return (
    <Section title="Discovery Magic Links">
      <form onSubmit={magicLinksDiscoverySend}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="text" id="email" name="email" ref={discoveryEMLEmailRef} required />
          <br />
          <label htmlFor="email">Locale: </label>
          <select name="locale" id="locale">
            <option value="">Unset</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="pt-br">Brazilian Portuguese</option>
          </select>
          <br />
          <label htmlFor="expiration">Expiration Minutes:</label>
          <input type="number" id="expiration_minutes" name="expiration_minutes" ref={discoveryEMLExpirationRef} />
        </div>
        <Button name="stytch.magicLinks.email.discovery.send" type="submit" />
        <br />
      </form>
      <Button
        name="stytch.magicLinks.discovery.authenticate()"
        onClick={magicLinksDiscoveryAuthenticate}
        // For EML discovery, the query params mention "discovery" but not "magic_links",
        // so we have to disambiguate from the other discovery types by checking for their absence
        glowing={hasDiscovery && !hasOauth && !hasPasswords}
      />
      <br />
    </Section>
  );
};

const Discovery = ({ dispatch }) => {
  return (
    <Section title="Discovery">
      <WorkbenchForm
        schema={[]}
        onSubmit={() => {
          dispatch(stytch.discovery.organizations.list());
        }}
        methodName="stytch.discovery.organizations.list"
      />
      <WorkbenchForm
        schema={[
          { name: 'org_id', kind: 'string' },
          { name: 'locale', kind: 'select', values: ['en', 'es', 'pt-br'] },
        ]}
        onSubmit={(req) => {
          const { org_id, locale } = req;
          dispatch(
            stytch.discovery.intermediateSessions.exchange({
              session_duration_minutes: 60,
              organization_id: org_id,
              locale: locale,
            }),
          );
        }}
        methodName="stytch.discovery.intermediateSessions.exchange"
      />
      <WorkbenchForm
        schema={[
          { name: 'org_name', kind: 'string' },
          { name: 'org_slug', kind: 'string' },
          { name: 'org_logo_url', kind: 'string' },
          { name: 'ssoJIT', kind: 'select', values: ['ALL_ALLOWED', 'RESTRICTED', 'NOT_ALLOWED'] },
          { name: 'allowed_domains', kind: 'string' },
          { name: 'emailJIT', kind: 'select', values: ['RESTRICTED', 'NOT_ALLOWED'] },
          { name: 'emailInvites', kind: 'select', values: ['ALL_ALLOWED', 'RESTRICTED', 'NOT_ALLOWED'] },
          { name: 'oauth_tenant_jit_provisioning', kind: 'select', values: ['RESTRICTED', 'NOT_ALLOWED'] },
          { name: 'allowed_oauth_tenants', kind: 'json' },
          { name: 'authMethods', kind: 'select', values: ['ALL_ALLOWED', 'RESTRICTED'] },
          { name: 'allowed_auth_methods', kind: 'string', is_csv: true },
          { name: 'mfaMethods', kind: 'select', values: ['ALL_ALLOWED', 'RESTRICTED'] },
          { name: 'allowed_mfa_methods', kind: 'string', is_csv: true },
          { name: 'mfaPolicy', kind: 'select', values: ['OPTIONAL', 'REQUIRED_FOR_ALL'] },
        ]}
        onSubmit={(req) => {
          const {
            org_name,
            org_slug,
            org_logo_url,
            ssoJIT,
            allowed_domains,
            emailJIT,
            emailInvites,
            oauth_tenant_jit_provisioning,
            allowed_oauth_tenants,
            authMethods,
            allowed_auth_methods,
            mfaMethods,
            allowed_mfa_methods,
            mfaPolicy,
          } = req;
          dispatch(
            stytch.discovery.organizations.create({
              session_duration_minutes: 60,
              organization_name: org_name,
              organization_slug: org_slug,
              organization_logo_url: org_logo_url,
              sso_jit_provisioning: ssoJIT,
              email_allowed_domains: allowed_domains,
              email_jit_provisioning: emailJIT,
              email_invites: emailInvites,
              oauth_tenant_jit_provisioning: oauth_tenant_jit_provisioning,
              allowed_oauth_tenants: allowed_oauth_tenants,
              auth_methods: authMethods,
              allowed_auth_methods: allowed_auth_methods,
              mfa_methods: mfaMethods,
              allowed_mfa_methods: allowed_mfa_methods,
              mfa_policy: mfaPolicy,
            }),
          );
        }}
        methodName="stytch.discovery.organizations.create"
      />
    </Section>
  );
};

const Passwords = ({ dispatch, chompToken, hasPasswords, hasDiscovery }) => {
  const passwordOrgIDRef = useRef();
  const passwordEmailRef = useRef();
  const passwordRef = useRef();
  const newPasswordRef = useRef();

  const passwordsAuthenticate = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const orgID = passwordOrgIDRef.current.value;
    const emailAddress = passwordEmailRef.current.value;
    const password = passwordRef.current.value;
    const locale = parseConstantValue(data, 'locale');

    return dispatch(
      stytch.passwords.authenticate({
        organization_id: orgID,
        email_address: emailAddress,
        password: password,
        session_duration_minutes: 60,
        locale: locale,
      }),
    );
  };

  const passwordsResetByEmailStart = (e) => {
    e.preventDefault();
    const orgID = passwordOrgIDRef.current.value;
    const emailAddress = passwordEmailRef.current.value;

    return dispatch(
      stytch.passwords.resetByEmailStart({
        organization_id: orgID,
        email_address: emailAddress,
        login_redirect_url: 'http://localhost:3000/',
        reset_password_redirect_url: 'http://localhost:3000/',
      }),
    );
  };

  const passwordsResetByEmail = (e) => {
    e.preventDefault();
    const data = new FormData(e.target.value);
    const password = passwordRef.current.value;
    const token = chompToken();
    const locale = parseConstantValue(data, 'locale');

    return dispatch(
      stytch.passwords.resetByEmail({
        password_reset_token: token,
        password: password,
        session_duration_minutes: 60,
        locale: locale || undefined,
      }),
    );
  };

  const passwordsResetByExistingPassword = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const orgID = passwordOrgIDRef.current.value;
    const emailAddress = passwordEmailRef.current.value;
    const existingPassword = passwordRef.current.value;
    const newPassword = newPasswordRef.current.value;
    const locale = parseConstantValue(data, 'locale');

    return dispatch(
      stytch.passwords.resetByExistingPassword({
        organization_id: orgID,
        email_address: emailAddress,
        existing_password: existingPassword,
        new_password: newPassword,
        session_duration_minutes: 60,
        locale: locale,
      }),
    );
  };

  const passwordsResetBySession = (e) => {
    e.preventDefault();
    const orgID = passwordOrgIDRef.current.value;
    const password = passwordRef.current.value;

    return dispatch(
      stytch.passwords.resetBySession({
        organization_id: orgID,
        password: password,
      }),
    );
  };

  const passwordsStrengthCheck = (e) => {
    e.preventDefault();
    const emailAddress = passwordEmailRef.current.value;
    const password = passwordRef.current.value;

    return dispatch(stytch.passwords.strengthCheck({ emailAddress, password }));
  };

  return (
    <Section title="Passwords">
      <form onSubmit={passwordsAuthenticate}>
        <div className="inputContainer">
          <label htmlFor="pw-org-id">Organization ID:</label>
          <input type="text" id="organization_id" name="organization_id" ref={passwordOrgIDRef} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="pw-email-address">Email Address:</label>
          <input type="text" id="email_address" name="email_address" ref={passwordEmailRef} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="pw-password">Password:</label>
          <input type="text" id="password" name="password" ref={passwordRef} required />
        </div>
        <label htmlFor="email">Locale: </label>
        <select name="locale" id="locale">
          <option value="">Unset</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="pt-br">Brazilian Portuguese</option>
        </select>
        <br />
        <Button name="stytch.passwords.authenticate()" type="submit" />
        <br />
        <Button name="stytch.passwords.resetByEmailStart()" onClick={passwordsResetByEmailStart} />
        <br />
        <Button
          name="stytch.passwords.resetByEmail()"
          onClick={passwordsResetByEmail}
          glowing={!hasDiscovery && hasPasswords}
        />
      </form>
      <form onSubmit={passwordsResetByExistingPassword}>
        <div className="inputContainer">
          <label htmlFor="new_password">New Password:</label>
          <input type="text" id="new_password" name="new_password" ref={newPasswordRef} required />
        </div>
        <label htmlFor="email">Locale: </label>
        <select name="locale" id="locale">
          <option value="">Unset</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="pt-br">Brazilian Portuguese</option>
        </select>
        <br />
        <Button name="stytch.passwords.resetByExistingPassword()" type="submit" />
      </form>
      <Button name="stytch.passwords.resetBySession()" onClick={passwordsResetBySession} />
      <br />
      <Button name="stytch.passwords.strengthCheck()" onClick={passwordsStrengthCheck} />
    </Section>
  );
};

const OAuth = ({ hasDiscovery, hasOauth, chompToken, dispatch }) => {
  const oauthOrgIDRef = useRef();
  const startOAuthFlowForProvider = (provider) => () => {
    const orgID = oauthOrgIDRef.current.value;
    return dispatch(
      stytch.oauth[provider].start({
        signup_redirect_url: getCallbackURL(),
        login_redirect_url: getCallbackURL(),
        organization_id: orgID,
      }),
    );
  };

  const startOAuthDiscoveryFlowForProvider = (provider) => () => {
    return dispatch(
      stytch.oauth[provider].discovery.start({
        discovery_redirect_url: getCallbackURL(),
      }),
    );
  };

  const startOneTapDiscovery = () =>
    dispatch(
      stytch.oauth.googleOneTap.discovery.start({
        discovery_redirect_url: getCallbackURL(),
      }),
    );

  const oauthAuthenticate = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const token = chompToken();
    if (!token) {
      return;
    }
    const locale = parseConstantValue(data, 'locale');
    return dispatch(
      stytch.oauth.authenticate({
        oauth_token: token,
        session_duration_minutes: 60,
        locale: locale,
      }),
    );
  };

  const oauthDiscoveryAuthenticate = async () => {
    const token = chompToken();
    if (!token) {
      return;
    }
    return dispatch(stytch.oauth.discovery.authenticate({ discovery_oauth_token: token }));
  };

  return (
    <Section title="OAuth">
      <div className="inputContainer">
        <label htmlFor="oauth-org-id">Organization ID:</label>
        <input type="text" id="organization_id" name="organization_id" ref={oauthOrgIDRef} required />
      </div>
      <Button name="stytch.oauth.google.start()" onClick={startOAuthFlowForProvider('google')} />
      <br />
      <Button name="stytch.oauth.google.discovery.start()" onClick={startOAuthDiscoveryFlowForProvider('google')} />
      <br />
      <Button name="stytch.oauth.microsoft.start()" onClick={startOAuthFlowForProvider('microsoft')} />
      <br />
      <Button
        name="stytch.oauth.microsoft.discovery.start()"
        onClick={startOAuthDiscoveryFlowForProvider('microsoft')}
      />
      <br />
      <Button name="stytch.oauth.googleOneTap.discovery.start()" onClick={startOneTapDiscovery} />
      <br />
      <Button name="stytch.oauth.hubspot.start()" onClick={startOAuthFlowForProvider('hubspot')} />
      <br />
      <Button name="stytch.oauth.hubspot.discovery.start()" onClick={startOAuthDiscoveryFlowForProvider('hubspot')} />
      <br />
      <Button name="stytch.oauth.slack.start()" onClick={startOAuthFlowForProvider('slack')} />
      <br />
      <Button name="stytch.oauth.slack.discovery.start()" onClick={startOAuthDiscoveryFlowForProvider('slack')} />
      <Button name="stytch.oauth.github.start()" onClick={startOAuthFlowForProvider('github')} />
      <br />
      <Button name="stytch.oauth.github.discovery.start()" onClick={startOAuthDiscoveryFlowForProvider('github')} />
      <WorkbenchForm
        schema={[{ name: 'organization_id', kind: 'string' }]}
        onSubmit={(req) =>
          dispatch(
            stytch.oauth.googleOneTap.start({
              organization_id: req.organization_id,
              signup_redirect_url: getCallbackURL(),
              login_redirect_url: getCallbackURL(),
            }),
          )
        }
        methodName="stytch.oauth.googleOneTap.start()"
      />
      <form onSubmit={oauthAuthenticate}>
        <div>
          <label htmlFor="email">Locale: </label>
          <select name="locale" id="locale">
            <option value="">Unset</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="pt-br">Brazilian Portuguese</option>
          </select>
          <br />
        </div>
        <Button name="stytch.oauth.authenticate()" type="submit" glowing={!hasDiscovery && hasOauth} />
        <br />
      </form>
      <Button
        name="stytch.oauth.discovery.authenticate()"
        onClick={oauthDiscoveryAuthenticate}
        glowing={hasDiscovery && hasOauth}
      />
    </Section>
  );
};

const SMSOtp = ({ dispatch }) => {
  const orgIDRefForSMSSend = useRef();
  const memberIDRefForSMSSend = useRef();
  const phoneNumberRefForSMSSend = useRef();
  const orgIDRefForSMSAuthenticate = useRef();
  const memberIDRefForSMSAuthenticate = useRef();
  const codeRefForSMSAuthenticate = useRef();

  const smsSend = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const orgID = orgIDRefForSMSSend.current.value;
    const memberID = memberIDRefForSMSSend.current.value;
    let phoneNumber = phoneNumberRefForSMSSend.current.value;
    if (phoneNumber.trim() === '') {
      phoneNumber = undefined;
    }
    const locale = parseConstantValue(data, 'locale');
    return dispatch(
      stytch.otps.sms.send({
        organization_id: orgID,
        member_id: memberID,
        mfa_phone_number: phoneNumber,
        locale: locale,
      }),
    );
  };

  const smsAuthenticate = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const orgID = orgIDRefForSMSAuthenticate.current.value;
    const memberID = memberIDRefForSMSAuthenticate.current.value;
    const code = codeRefForSMSAuthenticate.current.value;
    const setMFAEnrollment = parseConstantValue(data, 'set-mfa-enrollment');
    return dispatch(
      stytch.otps.sms.authenticate({
        organization_id: orgID,
        member_id: memberID,
        code: code,
        set_mfa_enrollment: setMFAEnrollment,
        session_duration_minutes: 60,
      }),
    );
  };

  return (
    <Section title="SMS OTP (MFA)">
      <form onSubmit={smsSend}>
        <div className="inputContainer">
          <label htmlFor="sms-send-org-id">Organization ID:</label>
          <input type="text" id="organization_id" name="organization_id" ref={orgIDRefForSMSSend} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="sms-send-member-id">Member ID:</label>
          <input type="text" id="member_id" name="member_id" ref={memberIDRefForSMSSend} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="sms-send-phone-number">Phone Number:</label>
          <input type="text" id="phone_number" name="phone_number" ref={phoneNumberRefForSMSSend} />
        </div>
        <div>
          <label htmlFor="locale">Locale: </label>
          <select name="locale" id="locale">
            <option value="">Unset</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="pt-br">Brazilian Portuguese</option>
          </select>
          <br />
        </div>
        <Button name="stytch.otps.sms.send()" type="submit" />
      </form>
      <form onSubmit={smsAuthenticate}>
        <div className="inputContainer">
          <label htmlFor="sms-authenticate-org-id">Organization ID:</label>
          <input type="text" id="organization_id" name="organization_id" ref={orgIDRefForSMSAuthenticate} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="sms-authenticate-member-id">Member ID:</label>
          <input type="text" id="member_id" name="member_id" ref={memberIDRefForSMSAuthenticate} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="sms-authenticate-code">Code:</label>
          <input type="text" id="code" name="code" ref={codeRefForSMSAuthenticate} />
        </div>
        <div>
          <label htmlFor="set-mfa-enrollment">Set MFA Enrollment: </label>
          <select name="set-mfa-enrollment" id="set-mfa-enrollment">
            <option value="">Unset</option>
            <option value="enroll">Enroll</option>
            <option value="unenroll">Unenroll</option>
          </select>
          <br />
        </div>
        <Button name="stytch.otps.sms.authenticate()" type="submit" />
      </form>
    </Section>
  );
};

const SSO = ({ dispatch }) => {
  return (
    <Section title="SSO">
      <WorkbenchForm
        methodName="stytch.sso.saml.createConnection()"
        schema={[
          { name: 'display_name', kind: 'string' },
          {
            name: 'identity_provider',
            kind: 'select',
            values: ['generic', 'okta', 'microsoft-entra', 'google-workspace'],
          },
        ]}
        onSubmit={(req) => dispatch(stytch.sso.saml.createConnection(req))}
      />
      <WorkbenchForm
        methodName="stytch.sso.saml.updateConnection()"
        schema={[
          { name: 'connection_id', kind: 'string' },
          { name: 'idp_entity_id', kind: 'string' },
          { name: 'display_name', kind: 'string' },
          { name: 'attribute_mapping', kind: 'json' },
          { name: 'idp_sso_url', kind: 'string' },
          { name: 'x509_certificate', kind: 'string' },
          {
            name: 'identity_provider',
            kind: 'select',
            values: ['generic', 'okta', 'microsoft-entra', 'google-workspace'],
          },
        ]}
        onSubmit={(req) => dispatch(stytch.sso.saml.updateConnection(req))}
      />
      <WorkbenchForm
        methodName="stytch.sso.saml.updateConnectionByURL()"
        schema={[
          { name: 'connection_id', kind: 'string' },
          { name: 'metadata_url', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.sso.saml.updateConnectionByURL(req))}
      />
      <WorkbenchForm
        methodName="stytch.sso.saml.deleteVerificationCertificate()"
        schema={[
          { name: 'connection_id', kind: 'string' },
          { name: 'certificate_id', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.sso.saml.deleteVerificationCertificate(req))}
      />
      <WorkbenchForm
        methodName="stytch.sso.oidc.createConnection()"
        schema={[
          { name: 'display_name', kind: 'string' },
          { name: 'identity_provider', kind: 'select', values: ['generic', 'okta', 'microsoft-entra'] },
        ]}
        onSubmit={(req) => dispatch(stytch.sso.oidc.createConnection(req))}
      />

      <WorkbenchForm
        methodName="stytch.sso.oidc.updateConnection()"
        schema={[
          { name: 'connection_id', kind: 'string' },
          { name: 'display_name', kind: 'string' },
          { name: 'issuer', kind: 'string' },
          { name: 'client_id', kind: 'string' },
          { name: 'client_secret', kind: 'string' },
          { name: 'authorization_url', kind: 'string' },
          { name: 'token_url', kind: 'string' },
          { name: 'userinfo_url', kind: 'string' },
          { name: 'jwks_url', kind: 'string' },
          { name: 'identity_provider', kind: 'select', values: ['generic', 'okta', 'microsoft-entra'] },
          { name: 'custom_scopes', kind: 'string' },
          { name: 'attribute_mapping', kind: 'json' },
        ]}
        onSubmit={(req) => dispatch(stytch.sso.oidc.updateConnection(req))}
      />
      <WorkbenchForm
        methodName="stytch.sso.external.createConnection()"
        schema={[
          { name: 'display_name', kind: 'string' },
          { name: 'external_organization_id', kind: 'string' },
          { name: 'external_connection_id', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.sso.external.createConnection(req))}
      />
      <WorkbenchForm
        methodName="stytch.sso.external.updateConnection()"
        schema={[
          { name: 'connection_id', kind: 'string' },
          { name: 'display_name', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.sso.external.updateConnection(req))}
      />
      <WorkbenchForm
        methodName="stytch.sso.getConnections()"
        schema={[]}
        onSubmit={() => dispatch(stytch.sso.getConnections())}
      />
      <WorkbenchForm
        methodName="stytch.sso.discoverConnections()"
        schema={[{ name: 'email_address', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.sso.discoverConnections(req.email_address))}
      />
      <WorkbenchForm
        methodName="stytch.sso.deleteConnection()"
        schema={[{ name: 'connection_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.sso.deleteConnection(req.connection_id))}
      />
    </Section>
  );
};

const SCIM_IDP_OBJECT = {
  name: 'identity_provider',
  kind: 'select',
  values: ['generic', 'okta', 'microsoft-entra', 'cyberark', 'jumpcloud', 'onelogin', 'pingfederate', 'rippling'],
};

const SCIM = ({ dispatch }) => {
  return (
    <Section title="SCIM">
      <WorkbenchForm
        methodName="stytch.scim.createConnection()"
        schema={[{ name: 'display_name', kind: 'string' }, SCIM_IDP_OBJECT]}
        onSubmit={(req) => dispatch(stytch.scim.createConnection(req))}
      />
      <WorkbenchForm
        methodName="stytch.scim.getConnection()"
        schema={[]}
        onSubmit={() => dispatch(stytch.scim.getConnection())}
      />
      <WorkbenchForm
        methodName="stytch.scim.deleteConnection()"
        schema={[{ name: 'connection_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.scim.deleteConnection(req.connection_id))}
      />
      <WorkbenchForm
        methodName="stytch.scim.rotateStart()"
        schema={[{ name: 'connection_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.scim.rotateStart(req.connection_id))}
      />
      <WorkbenchForm
        methodName="stytch.scim.rotateCancel()"
        schema={[{ name: 'connection_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.scim.rotateCancel(req.connection_id))}
      />
      <WorkbenchForm
        methodName="stytch.scim.rotateComplete()"
        schema={[{ name: 'connection_id', kind: 'string' }]}
        onSubmit={(req) => dispatch(stytch.scim.rotateComplete(req.connection_id))}
      />
      <WorkbenchForm
        methodName="stytch.scim.updateConnection()"
        schema={[
          { name: 'connection_id', kind: 'string' },
          { name: 'display_name', kind: 'string' },
          SCIM_IDP_OBJECT,
          { name: 'scim_group_implicit_role_assignments', kind: 'json' },
        ]}
        onSubmit={(req) => dispatch(stytch.scim.updateConnection(req))}
      />
      <WorkbenchForm
        methodName="stytch.scim.getConnectionGroups()"
        schema={[
          { name: 'limit', kind: 'number' },
          { name: 'cursor', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.scim.getConnectionGroups(req))}
      />
    </Section>
  );
};

const IDP = ({ dispatch }) => {
  return (
    <Section title="IDP">
      <WorkbenchForm
        methodName="Form Post Debugger"
        schema={[{ name: 'ping', kind: 'string' }]}
        onSubmit={(req) =>
          dispatch(
            stytch._networkClient.submitFormSDK({
              url: '/b2b/oauth/authorize',
              method: 'POST',
              body: req,
            }),
          )
        }
      />
    </Section>
  );
};

const RBAC = ({ dispatch }) => {
  return (
    <Section title="RBAC">
      <WorkbenchForm
        methodName="stytch.rbac.isAuthorizedSync()"
        schema={[
          { name: 'resource_id', kind: 'string' },
          { name: 'action', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.rbac.isAuthorizedSync(req.resource_id, req.action))}
      />
      <WorkbenchForm
        methodName="stytch.rbac.isAuthorized()"
        schema={[
          { name: 'resource_id', kind: 'string' },
          { name: 'action', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.rbac.isAuthorized(req.resource_id, req.action))}
      />
      <WorkbenchForm
        methodName="stytch.rbac.allPermissions()"
        schema={[]}
        onSubmit={() => dispatch(stytch.rbac.allPermissions())}
      />
    </Section>
  );
};

const EmailOTPs = ({ dispatch }) => {
  return (
    <Section title="Email OTPs">
      <WorkbenchForm
        methodName="stytch.otps.email.loginOrSignup"
        schema={[
          { name: 'email_address', kind: 'string' },
          { name: 'organization_id', kind: 'string' },
          { name: 'login_template_id', kind: 'string' },
          { name: 'signup_template_id', kind: 'string' },
          { name: 'locale', kind: 'string' },
          { name: 'login_expiration_minutes', kind: 'number' },
          { name: 'signup_expiration_minutes', kind: 'number' },
        ]}
        onSubmit={(req) => dispatch(stytch.otps.email.loginOrSignup(req))}
      />
      <WorkbenchForm
        methodName="stytch.otps.email.authenticate"
        schema={[
          { name: 'session_duration_minutes', kind: 'number' },
          { name: 'email_address', kind: 'string' },
          { name: 'organization_id', kind: 'string' },
          { name: 'code', kind: 'string' },
          { name: 'locale', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.otps.email.authenticate(req))}
      />
      <WorkbenchForm
        methodName="stytch.otps.email.discovery.send"
        schema={[
          { name: 'email_address', kind: 'string' },
          { name: 'login_template_id', kind: 'string' },
          { name: 'locale', kind: 'string' },
          { name: 'discovery_expiration_minutes', kind: 'number' },
        ]}
        onSubmit={(req) => dispatch(stytch.otps.email.discovery.send(req))}
      />
      <WorkbenchForm
        methodName="stytch.otps.email.discovery.authenticate"
        schema={[
          { name: 'email_address', kind: 'string' },
          { name: 'code', kind: 'string' },
        ]}
        onSubmit={(req) => dispatch(stytch.otps.email.discovery.authenticate(req))}
      />
    </Section>
  );
};

const TOTP = ({ dispatch }) => {
  const orgIDRefForTOTPCreate = useRef();
  const memberIDRefForTOTPCreate = useRef();
  const orgIDRefForTOTPAuthenticate = useRef();
  const memberIDRefForTOTPAuthenticate = useRef();
  const codeRefForTOTPAuthenticate = useRef();

  const totpCreate = async (e) => {
    e.preventDefault();
    const orgID = orgIDRefForTOTPCreate.current.value;
    const memberID = memberIDRefForTOTPCreate.current.value;
    return dispatch(
      stytch.totp.create({
        organization_id: orgID,
        member_id: memberID,
        expiration_minutes: 10,
      }),
    );
  };

  const totpAuthenticate = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const orgID = orgIDRefForTOTPAuthenticate.current.value;
    const memberID = memberIDRefForTOTPAuthenticate.current.value;
    const code = codeRefForTOTPAuthenticate.current.value;
    const setMFAEnrollment = parseConstantValue(data, 'set-mfa-enrollment');
    return dispatch(
      stytch.totp.authenticate({
        organization_id: orgID,
        member_id: memberID,
        code: code,
        set_mfa_enrollment: setMFAEnrollment,
        session_duration_minutes: 60,
      }),
    );
  };

  return (
    <Section title="TOTP (MFA)">
      <form onSubmit={totpCreate}>
        <div className="inputContainer">
          <label htmlFor="totp-send-org-id">Organization ID:</label>
          <input type="text" id="organization_id" name="organization_id" ref={orgIDRefForTOTPCreate} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="totp-send-member-id">Member ID:</label>
          <input type="text" id="member_id" name="member_id" ref={memberIDRefForTOTPCreate} required />
        </div>
        <Button name="stytch.totp.create()" type="submit" />
      </form>
      <form onSubmit={totpAuthenticate}>
        <div className="inputContainer">
          <label htmlFor="totp-authenticate-org-id">Organization ID:</label>
          <input type="text" id="organization_id" name="organization_id" ref={orgIDRefForTOTPAuthenticate} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="totp-authenticate-member-id">Member ID:</label>
          <input type="text" id="member_id" name="member_id" ref={memberIDRefForTOTPAuthenticate} required />
        </div>
        <div className="inputContainer">
          <label htmlFor="totp-authenticate-code">Code:</label>
          <input type="text" id="code" name="code" ref={codeRefForTOTPAuthenticate} />
        </div>
        <div>
          <label htmlFor="set-mfa-enrollment">Set MFA Enrollment: </label>
          <select name="set-mfa-enrollment" id="set-mfa-enrollment">
            <option value="">Unset</option>
            <option value="enroll">Enroll</option>
            <option value="unenroll">Unenroll</option>
          </select>
          <br />
        </div>
        <Button name="stytch.totp.authenticate()" type="submit" />
      </form>
    </Section>
  );
};

const RecoveryCodes = ({ dispatch }) => {
  return (
    <Section title="Recovery Codes">
      <WorkbenchForm
        methodName="stytch.recoveryCodes.recover()"
        schema={[
          { name: 'organization_id', kind: 'string' },
          { name: 'member_id', kind: 'string' },
          { name: 'recovery_code', kind: 'string' },
        ]}
        onSubmit={(req) => {
          req.session_duration_minutes = 60;
          dispatch(stytch.recoveryCodes.recover(req));
        }}
      />
      <WorkbenchForm
        methodName="stytch.recoveryCodes.rotate()"
        schema={[]}
        onSubmit={() => dispatch(stytch.recoveryCodes.rotate())}
      />
      <WorkbenchForm
        methodName="stytch.recoveryCodes.get()"
        schema={[]}
        onSubmit={() => dispatch(stytch.recoveryCodes.get())}
      />
    </Section>
  );
};

const Impersonation = ({ hasImpersonation, chompToken, dispatch }) => {
  const impersonationAuthenticate = (e) => {
    e.preventDefault();
    const token = chompToken();
    if (!token) {
      return;
    }
    return dispatch(stytch.impersonation.authenticate({ impersonation_token: token }));
  };

  return (
    <Section title="Impersonation">
      <form onSubmit={impersonationAuthenticate}>
        <Button name="stytch.impersonation.authenticate()" type="submit" glowing={hasImpersonation} />
        <br />
      </form>
    </Section>
  );
};

const WorkBench = () => {
  const [result, setResult] = useState('// Click some buttons and run some code!');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const timer = useTimer();

  const hasEml = window.location.search.includes('magic_links');
  const hasOauth = window.location.search.includes('oauth');
  const hasDiscovery = window.location.search.includes('discovery');
  const hasImpersonation = window.location.search.includes('impersonation');
  const hasPasswords = window.location.search.includes('passwords');

  const chompToken = () => {
    const currentLocation = new URL(window.location.href);
    const token = currentLocation.searchParams.get('token');
    if (!token) {
      dispatch(Promise.reject(new Error('No token detected in URL - do an OAuth or a magic link flow!')));
      return null;
    }
    currentLocation.searchParams.delete('token');
    currentLocation.searchParams.delete('type');
    currentLocation.searchParams.delete('stytch_token_type');
    window.history.replaceState({}, document.title, currentLocation.toString());
    return token;
  };

  const dispatch = (prom) => {
    setIsLoading(true);
    timer.start();
    return Promise.resolve(prom)
      .then((res) => {
        setIsLink(false);
        setIsError(false);
        setIsLoading(false);
        setResult(res);
        timer.stop();
        return res;
      })
      .catch((err) => {
        setIsLink(false);
        setIsError(true);
        setIsLoading(false);
        setResult(err);
        timer.stop();
      });
  };

  const sectionProps = { hasDiscovery, hasEml, hasOauth, hasImpersonation, chompToken, dispatch, hasPasswords };

  const stytchClient = useStytchB2BClient();
  const { member } = useStytchMember();
  const { organization } = useStytchOrganization();

  const authenticateByUrl = () => dispatch(stytch.authenticateByUrl({ session_duration_minutes: 60 }));

  return (
    <>
      <div className="workbench container xl">
        <div className="column">
          <h1>B2B SDK Workbench</h1>

          <Button
            name="stytch.authenticateByUrl()"
            onClick={authenticateByUrl}
            glowing={stytchClient.parseAuthenticateUrl()?.handled}
          />
          <hr />

          <Sessions {...sectionProps} />
          <Self {...sectionProps} />
          <Organization {...sectionProps} />
          <OrganizationMembers {...sectionProps} />
          <MagicLinks {...sectionProps} />
          <DiscoveryMagicLinks {...sectionProps} />
          <Discovery {...sectionProps} />
          <Passwords {...sectionProps} />
          <OAuth {...sectionProps} />
          <SMSOtp {...sectionProps} />
          <EmailOTPs {...sectionProps} />
          <TOTP {...sectionProps} />
          <RecoveryCodes {...sectionProps} />
          <RBAC {...sectionProps} />
          <SSO {...sectionProps} />
          <SCIM {...sectionProps} />
          <Impersonation {...sectionProps} />
          <IDP {...sectionProps} />
        </div>
        <div className="resultcontainer">
          <h3>
            You are{' '}
            {member
              ? `${member.email_address} (${organization?.organization_name ?? '(unknown organization)'})`
              : 'not logged in.'}
          </h3>
          <h3>Result: {isLoading ? '...' : ''}</h3>
          <Results className="results" content={result} isError={isError} isLink={isLink} />
          {timer.duration && <b>{Math.floor(timer.duration)} ms</b>}
        </div>
      </div>
    </>
  );
};

export default WorkBench;
