import { EMAIL_REGEX } from '../../shared/utils';
import { useGlobalReducer } from '../ContextProvider';

export const useUpdateMemberEmailAddress = () => {
  const [, dispatch] = useGlobalReducer();
  const setMemberEmailAddress = (emailAddress: string) => {
    dispatch({
      type: 'member/emailAddress',
      emailAddress: emailAddress,
      isValid: emailAddress.match(EMAIL_REGEX) != null,
    });
  };
  return { setMemberEmailAddress };
};
