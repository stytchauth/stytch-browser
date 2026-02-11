import { useGlobalReducer } from '../ContextProvider';
import { EMAIL_REGEX } from '../../shared/utils';

export const useUpdateUserEmailAddress = () => {
  const [, dispatch] = useGlobalReducer();
  const setUserEmailAddress = (emailAddress: string) => {
    dispatch({
      type: 'updateState/user/emailAddress',
      emailAddress: emailAddress,
      isValid: emailAddress.match(EMAIL_REGEX) != null,
    });
  };
  return { setUserEmailAddress };
};
