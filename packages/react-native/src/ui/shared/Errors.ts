import { StytchError } from '@stytch/core/public';

export class StytchUIInvalidConfiguration extends StytchError {
  constructor(message: string) {
    super('StytchUIInvalidConfiguration', message);
  }
}
