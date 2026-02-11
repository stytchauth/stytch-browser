/// <reference types="cypress" />

import * as OTPAuth from 'otpauth';

import type { CypressEnv } from '../../cypress.config';

const {
  emailName,
  fromEmail,
  // authenticateUrl,
  // existingEmailSubjectLine,
  newEmailSubjectLine,
  // signUpUrl,
  MAILOSAUR_SERVER_ID,
} = Cypress.env() as CypressEnv;

/**
 * Maps an async/await function f to a Cypress promise
 * https://docs.cypress.io/api/utilities/promise#Waiting-for-Promises
 * https://docs.cypress.io/faq/questions/using-cypress-faq#Can-I-use-the-new-ES7-async-await-syntax
 */
const chainAsync = <F extends (...args) => Promise<unknown>>(f: F) => {
  return (...args) => {
    return Cypress.Promise.resolve(f(...args));
  };
};

const createTOTPUsingSDK = async (win) => {
  const createResp = await win.stytch.totps.create({
    expiration_minutes: 5,
  });

  const totpAuth = new OTPAuth.TOTP({
    issuer: 'Stytch',
    label: 'AzureDiamond',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: createResp.secret,
  });
  const totp_code = totpAuth.generate();
  await win.stytch.totps.authenticate({
    totp_code,
    session_duration_minutes: 10,
  });

  return win.stytch.session.getSync();
};

const getActiveSessionObj = (win) => win.stytch.session.getSync();

describe('React Demo App', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // TODO: What do we actually want to test here?
  // What would be a complete test that gives us confidence in our behavior?

  it('Smoke test - can sign in with a magic link, enroll a TOTP, and then sign out', () => {
    const timestamp = new Date();
    const email = `${emailName}+${timestamp.getTime()}@${MAILOSAUR_SERVER_ID}.mailosaur.net`;

    cy.get('summary').contains('Magic Links').click();
    cy.get('#email').should('have.length', 1);
    cy.get('#email').type(`${email}{enter}`);

    cy.mailosaurGetMessage(
      MAILOSAUR_SERVER_ID,
      {
        sentTo: email,
      },
      {
        receivedAfter: timestamp,
      },
    ).then((email) => {
      // Backwards, but we want email.from[0].email to be one of the valid emails in fromEmail
      expect(fromEmail.split(',')).to.include(email.from[0].email);
      expect(email.subject).to.contain(newEmailSubjectLine);

      const tokenLink = email.text.links[0].href;
      cy.log(`Visiting ${tokenLink}`);
      cy.visit(tokenLink);
    });

    cy.get('button[name="stytch.magicLinks.authenticate()"]').should('have.length', 1).click();

    cy.contains('You are logged in.');

    cy.window().then(chainAsync(createTOTPUsingSDK));
    cy.window().then(getActiveSessionObj).its('authentication_factors').should('have.length', 2);

    cy.get('details').each(($details) => {
      const summaryText = $details.find('summary').text();

      if (summaryText.includes('Session') && !$details.attr('open')) {
        cy.wrap($details).find('summary').click();
      }
    });

    cy.get('button[name="stytch.session.revoke()"]').should('have.length', 1).click();

    cy.contains('You are not logged in.');
  });
});
