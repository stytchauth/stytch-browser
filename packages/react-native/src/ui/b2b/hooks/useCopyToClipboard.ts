import { readB2BInternals } from '../../../internals';
import { useStytch } from '../ContextProvider';

export const useCopyToClipboard = () => {
  const stytch = useStytch();
  const copyToClipboard = async (text: string) => readB2BInternals(stytch).nativeModule.Misc.copyToClipboard(text);
  return { copyToClipboard };
};
