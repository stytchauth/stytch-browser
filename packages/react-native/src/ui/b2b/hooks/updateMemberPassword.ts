import { useGlobalReducer } from '../ContextProvider';

export const useUpdateMemberPassword = () => {
  const [, dispatch] = useGlobalReducer();
  const setMemberPassword = (password: string) => {
    dispatch({ type: 'member/password', password: password });
  };
  return { setMemberPassword };
};
