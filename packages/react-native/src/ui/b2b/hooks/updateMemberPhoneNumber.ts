import { useGlobalReducer } from '../ContextProvider';

export const useUpdateMemberPhoneNumber = () => {
  const [, dispatch] = useGlobalReducer();
  const setMemberPhoneNumber = (countryCode: string, phoneNumber: string | undefined) => {
    dispatch({ type: 'member/phoneNumber', countryCode: countryCode, phoneNumber: phoneNumber });
  };
  return { setMemberPhoneNumber };
};
