/// <reference types="cypress" />

import type { CypressEnv } from 'cypress.config';
import type { Message } from 'cypress-mailosaur';
import * as OTPAuth from 'otpauth';

import { assertSuccessfulLogin, generatePassword } from './utils';

const { B2B_BASE_URL, emailName, MAILOSAUR_SERVER_ID } = Cypress.env() as CypressEnv;

Cypress.config('baseUrl', B2B_BASE_URL);

const mfaRequiredSlug = 'mfa-required';
const mfaRequiredOrgName = 'MFA Required';

const navigateToOrgLogin = () => {
  cy.visit(`/org/${mfaRequiredSlug}`);
};

const followMagicLink = (emailMessage: Message, tokenType: string) => {
  const link = emailMessage.text?.links?.find((link) => link.href?.includes(`stytch_token_type=${tokenType}`))?.href;

  expectDefined(link);
  cy.log(`Visiting ${link}`);
  cy.visit(link);
};

function expectDefined<T>(value: T): asserts value is Exclude<T, undefined> {
  expect(value).to.not.be.undefined;
}

describe('React B2B SDK UI Demo', () => {
  beforeEach(() => {
    navigateToOrgLogin();
  });

  it('MFA TOTP', () => {
    const timestamp = new Date();
    const emailAddress = `${emailName}+${timestamp.getTime()}@${MAILOSAUR_SERVER_ID}.mailosaur.net`;
    const password = generatePassword();

    // Create account
    cy.contains(`Continue to ${mfaRequiredOrgName}`).should('exist');

    cy.get('input[type="email"]').should('have.length', 1);
    cy.get('input[type="email"]').type(`${emailAddress}{enter}`);

    cy.get('button').contains('Email me a login link').click();

    cy.contains('Check your email').should('exist');

    cy.mailosaurGetMessage(MAILOSAUR_SERVER_ID, {
      sentTo: emailAddress,
      subject: 'Your account creation request for B2B E2E',
    }).then((message) => {
      cy.log(`Got email: ${message.subject} ${message.text?.body}`);
      followMagicLink(message, 'multi_tenant_magic_links');
    });

    // Enroll in TOTP
    cy.contains('Set up Multi-Factor Authentication').should('exist');

    cy.get('button').contains('Use an authenticator app').click();
    cy.get('button').contains('Having trouble scanning?').click();

    cy.get('div')
      .contains(/^[a-z0-9]{32}$/i)
      .then((codeEl) => {
        const secret = codeEl.text();
        const totpAuth = new OTPAuth.TOTP({
          issuer: 'Stytch',
          label: 'AzureDiamond',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: secret,
        });

        cy.get('button').contains('Continue').click();

        cy.get('input[autocomplete="one-time-code"]').type(totpAuth.generate());
      });

    cy.contains('Save your backup codes!').should('exist');

    cy.get('li')
      .then((elements) => elements.toArray().map((el) => el.textContent!))
      .as('backupCodes');

    cy.get('button').contains('Done').click();

    assertSuccessfulLogin();

    // Clear session info to force MFA for reset flow
    cy.clearAllCookies();
    cy.clearAllLocalStorage();

    // Trigger reset password email
    navigateToOrgLogin();
    cy.contains(`Continue to ${mfaRequiredOrgName}`).should('exist');

    cy.get('div').contains('Use a password instead').click();

    cy.contains('Log in with email and password').should('exist');

    cy.get('div').contains('Sign up or reset password').click();

    cy.contains('Check your email for help signing in').should('exist');

    cy.get('input[type="email"]').should('have.length', 1);
    cy.get('input[type="email"]').type(`${emailAddress}{enter}`);

    cy.contains('Check your email').should('exist');

    cy.mailosaurGetMessage(MAILOSAUR_SERVER_ID, {
      sentTo: emailAddress,
      subject: 'Reset your B2B E2E password',
    }).then((message) => {
      cy.log(`Got email: ${message.subject} ${message.text?.body}`);
      followMagicLink(message, 'multi_tenant_passwords');
    });

    cy.contains('Set a new password').should('exist');

    cy.get('input[type="password"]').should('have.length', 1);
    cy.get('input[type="password"]').type(password);

    cy.contains('button', 'Continue').closest('button').should('not.be.disabled').click();

    // Complete MFA via backup code
    cy.contains('Enter verification code').should('exist');

    cy.get('button').contains('Use a backup code').click();

    cy.contains('Enter backup code').should('exist');

    cy.get('@backupCodes').then((codes) => {
      cy.get('input').type(`${codes[0]}{enter}`);
    });

    assertSuccessfulLogin();

    // Login with new password
    navigateToOrgLogin();
    cy.contains(`Continue to ${mfaRequiredOrgName}`).should('exist');

    cy.get('div').contains('Use a password instead').click();

    cy.contains('Log in with email and password').should('exist');

    cy.get('input[type="email"]').should('have.length', 1);
    cy.get('input[type="email"]').type(emailAddress);
    cy.get('input[type="password"]').should('have.length', 1);
    cy.get('input[type="password"]').type(`${password}{enter}`);

    // MFA prompt should not appear since we just completed it
    assertSuccessfulLogin();
  });
});
