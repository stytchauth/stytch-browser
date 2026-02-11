import { useSearchParams } from 'react-router-dom';

const customStrings = {
  'loginPage.title': 'Custom title',
  'organizationLogin.title': 'Proceed to your {organizationName} account',
};

const adminPortalStrings = {
  'members.title': 'Users',
};

const useStrings = (customStrings: Record<string, string>) => {
  const [searchParams] = useSearchParams();
  const locale = searchParams.get('locale');

  if (locale === 'custom') {
    return customStrings;
  }

  return undefined;
};

export const useB2BStrings = () => {
  return useStrings(customStrings);
};

export const useAdminPortalStrings = () => {
  return useStrings(adminPortalStrings);
};
