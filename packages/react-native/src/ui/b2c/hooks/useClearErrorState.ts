import { useGlobalReducer } from '../ContextProvider';

export const useClearErrorState = () => {
  const [, dispatch] = useGlobalReducer();
  const clearErrorState = () => {
    dispatch({ type: 'updateState/error/clear' });
  };
  return { clearErrorState };
};
