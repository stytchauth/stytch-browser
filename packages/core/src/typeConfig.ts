import './globalTypeConfig';

import { StytchProjectConfiguration, StytchProjectConfigurationInput } from './public/typeConfig';

type BooleanOption<TInput extends boolean, TTrue, TFalse> = TInput extends true
  ? TTrue
  : TInput extends false
    ? TFalse
    : TTrue | TFalse;

type ReadProjectConfig<
  TKey extends keyof StytchProjectConfiguration,
  TUserConfig extends StytchProjectConfigurationInput,
  TDefaultValue = Stytch.DefaultProjectConfiguration[TKey],
> = TUserConfig[TKey] extends StytchProjectConfiguration[TKey] ? TUserConfig[TKey] : TDefaultValue;

export type ExtractOpaqueTokens<TProjectConfiguration extends StytchProjectConfigurationInput> = ReadProjectConfig<
  'OpaqueTokens',
  TProjectConfiguration
>;

export type AllowedOpaqueTokens = ExtractOpaqueTokens<StytchProjectConfigurationInput>;
export type OpaqueTokensNeverConfig = { OpaqueTokens: false };
export type OpaqueTokensNever = false;

export type IfOpaqueTokens<TIsOpaque extends boolean, TWhenOpaque, TWhenReadable> = BooleanOption<
  TIsOpaque,
  TWhenOpaque,
  TWhenReadable
>;

export type RedactedToken = '';
