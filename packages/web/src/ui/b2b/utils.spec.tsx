import { AuthFlowType } from '@stytch/core/public';
import React from 'react';

import { renderHook, waitFor } from '../../testUtils';
import { MockGlobalContextProvider, setWindowLocation } from '../flows/b2b/helpers';
import { AppScreens } from './types/AppScreens';
import { extractFromPattern, useExtractSlug } from './utils';

describe('extractFromPattern', () => {
  const cases = [
    [null, 'https://example.com/org/test-slug', null],
    ['https://example.com/org/{{slug}}', 'https://example.com/org/test-slug', 'test-slug'],
    ['https://example.com/org/{{slug}}', 'https://example.com/org/test-slug?foo=bar', 'test-slug'],
    ['https://example.com/org/{{slug}}', 'https://example.com/org/test-slug?foo={{slug}}', 'test-slug'],
    ['https://example.com/org/{{slug}}', 'https://example.com/test-slug', null],
    [
      'https://test-*-app.example.com/org/{{slug}}',
      'https://test-deployment-app.example.com/org/test-slug',
      'test-slug',
    ],
    [
      'https://test-*-app.example.com/org/{{slug}}',
      'https://test-deployment-app.sub-app.example.com/org/test-slug',
      null,
    ],
    ['https://{{slug}}.app.example.com', 'https://test-slug.app.example.com', 'test-slug'],
    [
      'https://test-*-app.{{slug}}.app.example.com',
      'https://test-deployment-app.test-slug.app.example.com',
      'test-slug',
    ],
    [
      'https://{{slug}}.test-*-app.app.example.com',
      'https://test-slug.test-deployment-app.app.example.com',
      'test-slug',
    ],
  ] as const;

  cases.forEach(([pattern, href, expected]) => {
    it(`should extract ${expected} from pattern ${pattern} and URL ${href}`, () => {
      expect(extractFromPattern(pattern, href)).toBe(expected);
    });
  });
});

describe('useExtractSlug', () => {
  const mockStytchClient = {
    organization: {
      getBySlug: jest.fn(),
    },
  };

  const renderUseExtractSlug = (slugPattern: string | null, organizationSlug?: string | null) => {
    const state = { flowState: { organization: null, type: AuthFlowType.Organization }, screen: AppScreens.Main };
    const internals = {
      bootstrap: {
        getAsync: jest.fn().mockResolvedValue({ slugPattern }),
      },
    };

    return renderHook(useExtractSlug, {
      wrapper: ({ children }) => (
        <MockGlobalContextProvider
          client={mockStytchClient}
          config={{
            authFlowType: AuthFlowType.Organization,
            sessionOptions: { sessionDurationMinutes: 60 },
            products: [],
            organizationSlug,
          }}
          state={state}
          internals={internals}
        >
          {children}
        </MockGlobalContextProvider>
      ),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('from config', () => {
    it('should use the organization slug from the config', async () => {
      const { result } = renderUseExtractSlug(null, 'test-slug');

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledTimes(1);
      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledWith({ organization_slug: 'test-slug' });
      expect(result.current.slug).toBe('test-slug');
    });

    it('should not look up an organization if configured slug is null', async () => {
      const { result } = renderUseExtractSlug(null, null);

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).not.toHaveBeenCalled();
      expect(result.current.slug).toBeNull();
    });

    it('should not look up an organization if configured slug is undefined', async () => {
      const { result } = renderUseExtractSlug(null, undefined);

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).not.toHaveBeenCalled();
      expect(result.current.slug).toBeNull();
    });

    it('should prefer the configured slug over the URL slug', async () => {
      const { result } = renderUseExtractSlug('https://example.com/org/{{slug}}', 'slug-from-config');

      setWindowLocation('https://example.com/org/test-slug');

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledTimes(1);
      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledWith({ organization_slug: 'slug-from-config' });
      expect(result.current.slug).toBe('slug-from-config');
    });
  });

  describe('from URL slug pattern', () => {
    it('should look up the organization by slug in path', async () => {
      const { result } = renderUseExtractSlug('https://example.com/org/{{slug}}');

      setWindowLocation('https://example.com/org/test-slug');

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledTimes(1);
      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledWith({ organization_slug: 'test-slug' });
      expect(result.current.slug).toBe('test-slug');
    });

    it('should look up the organization by path with wildcard domain', async () => {
      const { result } = renderUseExtractSlug('https://test-*-app.example.com/org/{{slug}}');

      setWindowLocation('https://test-deployment-app.example.com/org/test-slug');

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledTimes(1);
      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledWith({ organization_slug: 'test-slug' });
      expect(result.current.slug).toBe('test-slug');
    });

    it('should look up the organization by slug in domain', async () => {
      const { result } = renderUseExtractSlug('https://{{slug}}.app.example.com');

      setWindowLocation('https://test-slug.app.example.com');

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledTimes(1);
      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledWith({ organization_slug: 'test-slug' });
      expect(result.current.slug).toBe('test-slug');
    });

    it('should look up the organization by slug in domain with wildcard', async () => {
      const { result } = renderUseExtractSlug('https://test-*-app.{{slug}}.app.example.com');

      setWindowLocation('https://test-deployment-app.test-slug.app.example.com');

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledTimes(1);
      expect(mockStytchClient.organization.getBySlug).toHaveBeenCalledWith({ organization_slug: 'test-slug' });
      expect(result.current.slug).toBe('test-slug');
    });

    it('should not look up an organization if URL does not match pattern', async () => {
      const { result } = renderUseExtractSlug('https://example.com/org/{{slug}}');

      setWindowLocation('https://example.com/invalid');

      await waitFor(() => {
        expect(result.current.resultPending).toBe(false);
      });

      expect(mockStytchClient.organization.getBySlug).not.toHaveBeenCalled();
      expect(result.current.slug).toBeNull();
    });
  });

  it('should return no slug when neither slug pattern nor config are provided', async () => {
    const { result } = renderUseExtractSlug(null, null);

    await waitFor(() => {
      expect(result.current.resultPending).toBe(false);
    });

    expect(result.current.slug).toBeNull();
  });
});
