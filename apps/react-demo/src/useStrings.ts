import { useSearchParams } from 'react-router-dom';

const customStrings = {
  'buttonPrimary.sms': 'Login via SMS',
  'buttonPrimary.email_login': 'Login via Email',
  'buttonPrimary.whatsapp': 'Login via WhatsApp',
};

const useStrings = (customStrings: Record<string, string>) => {
  const [searchParams] = useSearchParams();
  const locale = searchParams.get('locale');

  if (locale === 'custom') {
    return customStrings;
  }

  return undefined;
};

export const useB2CStrings = () => {
  return useStrings(customStrings);
};
