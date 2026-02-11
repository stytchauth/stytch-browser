import { useGlobalReducer } from '../ContextProvider';

export const useClearErrorState = () => {
  const [, dispatch] = useGlobalReducer();
  const clearErrorState = () => {
    dispatch({ type: 'error/clear' });
  };
  return { clearErrorState };
};
