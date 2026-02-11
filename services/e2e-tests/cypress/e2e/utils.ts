export function generatePassword(): string {
  const uniqueSeed = Date.now().toString();
  const suffix = Cypress._.uniqueId(uniqueSeed);
  return `SnapCracklePop!${suffix}`;
}

export function assertSuccessfulLogin() {
  cy.contains('You have successfully logged in.');
}
