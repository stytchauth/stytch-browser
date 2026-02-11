import { useGlobalReducer } from '../ContextProvider';

export const useUpdateUserPhoneNumber = () => {
  const [, dispatch] = useGlobalReducer();
  const setUserPhoneNumber = (
    countryCode: string,
    phoneNumber: string | undefined,
    formattedPhoneNumber: string | undefined,
  ) => {
    dispatch({
      type: 'updateState/user/phoneNumber',
      countryCode: countryCode,
      phoneNumber: phoneNumber,
      formattedPhoneNumber: formattedPhoneNumber,
    });
  };
  return { setUserPhoneNumber };
};
