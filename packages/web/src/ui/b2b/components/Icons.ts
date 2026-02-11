import {
  GithubIcon,
  GmailIcon,
  GoogleIcon,
  HubspotIcon,
  MicrosoftIcon,
  OktaIcon,
  OutlookIcon,
  SlackIcon,
  YahooIcon,
} from '../../../assets/logo-color';

export const oauthIcons = {
  google: GoogleIcon,
  microsoft: MicrosoftIcon,
  hubspot: HubspotIcon,
  slack: SlackIcon,
  github: GithubIcon,
};

export const ssoIcons = {
  google: GoogleIcon,
  microsoft: MicrosoftIcon,
  okta: OktaIcon,
};

export const emailIcons = {
  gmail: GmailIcon,
  outlook: OutlookIcon,
  yahoo: YahooIcon,
};

export type IconNames =
  | keyof typeof oauthIcons //
  | keyof typeof ssoIcons
  | keyof typeof emailIcons;
