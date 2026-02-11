import { useGlobalReducer } from '../ContextProvider';

export const useGoBack = () => {
  const [, dispatch] = useGlobalReducer();
  const goBack = () => {
    dispatch({ type: 'navigate/goBack' });
  };
  return { goBack };
};
