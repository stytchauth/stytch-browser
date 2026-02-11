import loadStytch from './stytchClient';

const stytch = loadStytch();

export const UserService = {
  delete: async function (user_id: string) {
    return stytch.users.delete({ user_id });
  },
};
