/// <reference types="cypress" />

import { Link } from 'cypress-mailosaur';
import { assertSuccessfulLogin, generatePassword } from './utils';

const { emailName, MAILOSAUR_SERVER_ID } = Cypress.env();

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

function signupWithNewPassword({ email, password }: { email: string; password: string }) {
  cy.contains('Sign up or log in').should('exist');

  cy.get('input[type="email"]').should('have.length', 1);
  cy.get('input[type="email"]').type(`${email}{enter}`);

  cy.contains('Finish creating your account by setting a password.').should('exist');

  cy.get('input[type="password"]').should('have.length', 1);
  cy.get('input[type="password"]').type(password);

  cy.get('button[type="submit"]').click();
}

function signInWithExistingPassword({ email, password }: { email: string; password: string }) {
  cy.contains('Sign up or log in').should('exist');

  cy.get('input[type="email"]').should('have.length', 1);
  cy.get('input[type="email"]').type(`${email}{enter}`);

  cy.contains('Log In').should('exist');

  cy.get('input[type="password"]').should('have.length', 1);
  cy.get('input[type="password"]').type(password);

  cy.get('button[type="submit"]').click();
}

function requestPasswordReset({ email }: { email: string }) {
  cy.contains('Sign up or log in').should('exist');

  cy.get('input[type="email"]').should('have.length', 1);
  cy.get('input[type="email"]').type(`${email}{enter}`);
  cy.contains('Forgot Password?').click();
}

function parseResetPasswordLinks(links: Link[]) {
  if (links.length != 2) {
    throw Error(`Expected two links in reset password email, got ${links.length}`);
  }

  if (links[0].href.includes('stytch_token_type=reset_password')) {
    return {
      resetPasswordLink: links[0].href,
      magicLinksLink: links[1].href,
    };
  } else {
    return {
      resetPasswordLink: links[1].href,
      magicLinksLink: links[0].href,
    };
  }
}

describe('React SDK UI Demo', () => {
  beforeEach(() => {
    cy.visit('/password-only');
  });

  it('Can sign up with a new email + password account', () => {
    const timestamp = new Date();
    const email = `test+${timestamp.getTime()}@stytch.com`;
    const goodPassword = generatePassword();

    signupWithNewPassword({
      email,
      password: goodPassword,
    });

    assertSuccessfulLogin();
  });

  it('Can sign in with an existing password account', () => {
    const timestamp = new Date();
    const email = `test+${timestamp.getTime()}@stytch.com`;
    const goodPassword = generatePassword();

    signupWithNewPassword({
      email,
      password: goodPassword,
    });

    assertSuccessfulLogin();

    cy.visit('/password-only');

    signInWithExistingPassword({
      email,
      password: goodPassword,
    });

    assertSuccessfulLogin();
  });

  it('Password reset - complete reset flow', () => {
    const timestamp = new Date();
    const email = `${emailName}+${timestamp.getTime()}@${MAILOSAUR_SERVER_ID}.mailosaur.net`;
    const initialPassword = generatePassword();
    const nextPassword = generatePassword();

    signupWithNewPassword({
      email,
      password: initialPassword,
    });

    assertSuccessfulLogin();

    cy.visit('/password-only');

    requestPasswordReset({ email });

    cy.mailosaurGetMessage(MAILOSAUR_SERVER_ID, { sentTo: email }, { receivedAfter: timestamp }).then((email) => {
      const passwordLinks = parseResetPasswordLinks(email.text.links);
      cy.log(`Visiting ${passwordLinks.resetPasswordLink}`);
      cy.visit(passwordLinks.resetPasswordLink);
    });

    cy.get('#new-password').should('have.length', 1);
    cy.get('#new-password').type(`${nextPassword}`);
    cy.get('button[type="submit"]').click();

    assertSuccessfulLogin();

    cy.visit('/password-only');

    signInWithExistingPassword({
      email,
      password: nextPassword,
    });

    assertSuccessfulLogin();
  });

  it('Password reset - magic link flow', () => {
    const timestamp = new Date();
    const email = `${emailName}+${timestamp.getTime()}@${MAILOSAUR_SERVER_ID}.mailosaur.net`;
    const initialPassword = generatePassword();

    signupWithNewPassword({
      email,
      password: initialPassword,
    });

    assertSuccessfulLogin();

    cy.visit('/password-only');

    requestPasswordReset({ email });

    cy.mailosaurGetMessage(MAILOSAUR_SERVER_ID, { sentTo: email }, { receivedAfter: timestamp }).then((email) => {
      const passwordLinks = parseResetPasswordLinks(email.text.links);
      cy.log(`Visiting ${passwordLinks.magicLinksLink}`);
      cy.visit(passwordLinks.magicLinksLink);
    });

    assertSuccessfulLogin();
  });

  it('Password reset by existing password (Headless SDK)', () => {
    const timestamp = new Date();
    const email = `${emailName}+${timestamp.getTime()}@${MAILOSAUR_SERVER_ID}.mailosaur.net`;
    const initialPassword = generatePassword();
    const nextPassword = generatePassword();

    signupWithNewPassword({
      email,
      password: initialPassword,
    });

    assertSuccessfulLogin();

    cy.window().then(
      chainAsync((win) =>
        win.stytch.passwords.resetByExistingPassword({
          email: email,
          existing_password: initialPassword,
          new_password: nextPassword,
          session_duration_minutes: 60,
        }),
      ),
    );

    cy.visit('/password-only');

    signInWithExistingPassword({
      email,
      password: nextPassword,
    });

    assertSuccessfulLogin();
  });
});
