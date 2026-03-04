import React, { ReactNode } from 'react';

import { messages } from '../../../messages/en';
import { render, screen } from '../../../testUtils';
import { emailMagicLinks } from '../../b2c/Products';
import { I18nProviderWrapper } from '../atoms/I18nProviderWrapper';
import { PresentationContext, usePresentationWithDefault } from '../PresentationConfig';
import { EmailProviderInfo, emailProviderInfo, EmailProviderLink } from './EmailProviderLink';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProviderWrapper messages={messages}>
    <PresentationContext.Provider value={usePresentationWithDefault(undefined, false, { products: [emailMagicLinks] })}>
      {children}
    </PresentationContext.Provider>
  </I18nProviderWrapper>
);

const renderEmailProviderLink = (providerInfo: EmailProviderInfo, emailDomain: string | null) =>
  render(<EmailProviderLink providerInfo={providerInfo} emailDomain={emailDomain} />, { wrapper: Wrapper });

describe('EmailProviderLink', () => {
  describe('Gmail provider', () => {
    it('generates fallback link when emailDomain is null', () => {
      renderEmailProviderLink(emailProviderInfo.gmail, null);
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('https://mail.google.com/mail/u/0/#search/in%3Aanywhere');
    });

    it('generates scoped search link when emailDomain is provided', () => {
      renderEmailProviderLink(emailProviderInfo.gmail, 'stytch.com');
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe(
        'https://mail.google.com/mail/u/0/#search/from%3A%40stytch.com%20in%3Aanywhere',
      );
    });
  });

  describe('Yahoo provider', () => {
    it('generates fallback link when emailDomain is null', () => {
      renderEmailProviderLink(emailProviderInfo.yahoo, null);
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('https://mail.yahoo.com/d/search/referrer=unread');
    });

    it('generates scoped search link when emailDomain is provided', () => {
      renderEmailProviderLink(emailProviderInfo.yahoo, 'stytch.com');
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('https://mail.yahoo.com/d/search/keyword=stytch.com');
    });
  });

  describe('Outlook provider', () => {
    it('generates inbox link regardless of emailDomain', () => {
      renderEmailProviderLink(emailProviderInfo.outlook, null);
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('https://outlook.office.com/mail/0/inbox');
    });

    it('generates same inbox link when emailDomain is provided', () => {
      renderEmailProviderLink(emailProviderInfo.outlook, 'stytch.com');
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('https://outlook.office.com/mail/0/inbox');
    });
  });

  describe('Link behavior', () => {
    it('opens links in new tab with proper attributes', () => {
      renderEmailProviderLink(emailProviderInfo.gmail, null);
      const link = screen.getByRole('link');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });
});
