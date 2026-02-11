import { useGlobalReducer } from '../ContextProvider';

export const useDidFinishEditingEmailAddress = () => {
  const [state, dispatch] = useGlobalReducer();
  const setDidFinishEditingEmailAddress = () => {
    if (state.memberState.emailAddress.emailAddress) {
      dispatch({
        type: 'member/emailAddress/didFinish',
      });
    }
  };
  return { setDidFinishEditingEmailAddress };
};
