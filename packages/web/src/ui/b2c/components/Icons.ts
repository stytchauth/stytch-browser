import {
  AmazonIcon,
  AppleIcon,
  BinanceIcon,
  BitbucketIcon,
  CoinbaseIcon,
  DiscordIcon,
  FacebookIcon,
  FigmaIcon,
  GithubIcon,
  GitlabIcon,
  GmailIcon,
  GoogleIcon,
  LinkedinIcon,
  MetamaskIcon,
  MicrosoftIcon,
  OutlookIcon,
  PhantomIcon,
  SalesforceIcon,
  SlackIcon,
  SnapchatIcon,
  TiktokIcon,
  TwitchIcon,
  XTwitterIcon,
  YahooIcon,
} from '../../../assets/logo-color';
import type { IconRegistry } from '../../components/IconRegistry';

export const oauthIcons = {
  amazon: AmazonIcon,
  apple: AppleIcon,
  bitbucket: BitbucketIcon,
  coinbase: CoinbaseIcon,
  discord: DiscordIcon,
  facebook: FacebookIcon,
  figma: FigmaIcon,
  github: GithubIcon,
  gitlab: GitlabIcon,
  google: GoogleIcon,
  linkedin: LinkedinIcon,
  microsoft: MicrosoftIcon,
  salesforce: SalesforceIcon,
  slack: SlackIcon,
  snapchat: SnapchatIcon,
  tiktok: TiktokIcon,
  twitch: TwitchIcon,
  xTwitter: XTwitterIcon,
  yahoo: YahooIcon,
} satisfies IconRegistry<string>;

export const cryptoIcons = {
  phantom: PhantomIcon,
  metamask: MetamaskIcon,
  binance: BinanceIcon,
  coinbase: CoinbaseIcon,
} satisfies IconRegistry<string>;

export const emailIcons = {
  gmail: GmailIcon,
  outlook: OutlookIcon,
  yahoo: YahooIcon,
} satisfies IconRegistry<string>;

export type IconNames =
  | keyof typeof oauthIcons //
  | keyof typeof cryptoIcons
  | keyof typeof emailIcons;
