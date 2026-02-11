import { useGlobalReducer } from '../ContextProvider';

export const useUpdateUserPassword = () => {
  const [, dispatch] = useGlobalReducer();
  const setUserPassword = (password: string) => {
    dispatch({ type: 'updateState/user/password', password: password });
  };
  return { setUserPassword };
};
