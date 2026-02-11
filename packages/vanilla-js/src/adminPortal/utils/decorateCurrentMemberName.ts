import { NO_VALUE } from './noValue';

export const decorateCurrentMemberName = (name: string) => `${name || NO_VALUE} (You)`;
