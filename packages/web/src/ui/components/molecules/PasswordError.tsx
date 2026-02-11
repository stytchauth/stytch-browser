import { msg, plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { BootstrapData } from '@stytch/core';
import React from 'react';

import Column from '../atoms/Column';
import Typography from '../atoms/Typography';
import VisuallyHidden from '../atoms/VisuallyHidden';
import styles from './PasswordError.module.css';
import type { PasswordInputProps } from './PasswordInput';
import { PasswordStrengthCheck } from './PasswordStrengthCheck';

// This list of warnings and suggestions should be exhaustive, and is pulled from https://github.com/stytchauth/zxcvbn/blob/main/feedback/feedback.go
const warnings = {
  'Short keyboard patterns are easy to guess.': msg({
    id: 'password.zxcvbn.warning.shortKeyboardPatterns',
    message: 'Short keyboard patterns are easy to guess.',
  }),
  'Straight rows of keys are easy to guess.': msg({
    id: 'password.zxcvbn.warning.straightRows',
    message: 'Straight rows of keys are easy to guess.',
  }),
  'Repeats like "aaa" are easy to guess.': msg({
    id: 'password.zxcvbn.warning.repeats',
    message: 'Repeats like "aaa" are easy to guess.',
  }),
  'Repeats like "abcabcabc" are only slightly harder to guess than "abc".': msg({
    id: 'password.zxcvbn.warning.longerRepeats',
    message: 'Repeats like "abcabcabc" are only slightly harder to guess than "abc".',
  }),
  'Sequences like "abc" or "6543" are easy to guess.': msg({
    id: 'password.zxcvbn.warning.sequences',
    message: 'Sequences like "abc" or "6543" are easy to guess.',
  }),
  'Recent years are easy to guess.': msg({
    id: 'password.zxcvbn.warning.recentYears',
    message: 'Recent years are easy to guess.',
  }),
  'Dates are often easy to guess.': msg({
    id: 'password.zxcvbn.warning.dates',
    message: 'Dates are often easy to guess.',
  }),
  'This is a top-10 common password.': msg({
    id: 'password.zxcvbn.warning.top10CommonPassword',
    message: 'This is a top-10 common password.',
  }),
  'This is a top-100 common password.': msg({
    id: 'password.zxcvbn.warning.top100CommonPassword',
    message: 'This is a top-100 common password.',
  }),
  'This is a very common password.': msg({
    id: 'password.zxcvbn.warning.veryCommonPassword',
    message: 'This is a very common password.',
  }),
  'This is similar to a commonly used password.': msg({
    id: 'password.zxcvbn.warning.similarToCommonPassword',
    message: 'This is similar to a commonly used password.',
  }),
  'A word by itself is easy to guess.': msg({
    id: 'password.zxcvbn.warning.wordByItself',
    message: 'A word by itself is easy to guess.',
  }),
  'Names and surnames by themselves are easy to guess.': msg({
    id: 'password.zxcvbn.warning.names',
    message: 'Names and surnames by themselves are easy to guess.',
  }),
  'Common names and surnames are easy to guess.': msg({
    id: 'password.zxcvbn.warning.commonNames',
    message: 'Common names and surnames are easy to guess.',
  }),
};

const suggestions = {
  'Use a few words, avoid common phrases.': msg({
    id: 'password.zxcvbn.suggestion.useAFewWords',
    message: 'Use a few words, avoid common phrases.',
  }),
  'No need for symbols, digits, or uppercase letters.': msg({
    id: 'password.zxcvbn.suggestion.noSymbolsDigitsUppercase',
    message: 'No need for symbols, digits, or uppercase letters.',
  }),
  'Add another word or two. Uncommon words are better.': msg({
    id: 'password.zxcvbn.suggestion.addWords',
    message: 'Add another word or two. Uncommon words are better.',
  }),
  'Use a longer keyboard pattern with more turns.': msg({
    id: 'password.zxcvbn.suggestion.longerKeyboardPattern',
    message: 'Use a longer keyboard pattern with more turns.',
  }),
  'Avoid repeated words and characters.': msg({
    id: 'password.zxcvbn.suggestion.avoidRepeats',
    message: 'Avoid repeated words and characters.',
  }),
  'Avoid sequences.': msg({
    id: 'password.zxcvbn.suggestion.avoidSequences',
    message: 'Avoid sequences.',
  }),
  'Avoid recent years.': msg({
    id: 'password.zxcvbn.suggestion.avoidRecentYears',
    message: 'Avoid recent years.',
  }),
  'Avoid years that are associated with you.': msg({
    id: 'password.zxcvbn.suggestion.avoidYearsAssociatedWithYou',
    message: 'Avoid years that are associated with you.',
  }),
  'Avoid dates and years that are associated with you.': msg({
    id: 'password.zxcvbn.suggestion.avoidDatesAndYearsAssociatedWithYou',
    message: 'Avoid dates and years that are associated with you.',
  }),
  "Capitalization doesn't help very much.": msg({
    id: 'password.zxcvbn.suggestion.capitalization',
    message: "Capitalization doesn't help very much.",
  }),
  'All-uppercase is almost as easy to guess as all-lowercase.': msg({
    id: 'password.zxcvbn.suggestion.allUppercase',
    message: 'All-uppercase is almost as easy to guess as all-lowercase.',
  }),
  "Reversed words aren't much harder to guess.": msg({
    id: 'password.zxcvbn.suggestion.reversed',
    message: "Reversed words aren't much harder to guess.",
  }),
  "Predictable substitutions like '@' instead of 'a' don't help very much.": msg({
    id: 'password.zxcvbn.suggestion.predictableSubstitutions',
    message: "Predictable substitutions like '@' instead of 'a' don't help very much.",
  }),
};

const labels = {
  fulfilled: msg({ id: 'password.requirement.fulfilled', message: 'Fulfilled' }),
  notFulfilled: msg({ id: 'password.requirement.notFulfilled', message: 'Not fulfilled' }),
  warning: msg({ id: 'password.requirement.warning', message: 'Warning' }),
  suggestion: msg({ id: 'password.requirement.suggestion', message: 'Suggestion' }),
} as const;

const CrossIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.6667 4.27334L11.7267 3.33334L8.00001 7.06001L4.27334 3.33334L3.33334 4.27334L7.06001 8.00001L3.33334 11.7267L4.27334 12.6667L8.00001 8.94001L11.7267 12.6667L12.6667 11.7267L8.94001 8.00001L12.6667 4.27334Z"
      fill="currentColor"
    />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.86332 10.5833L3.08332 7.80333L2.13666 8.74333L5.86332 12.47L13.8633 4.47L12.9233 3.53L5.86332 10.5833Z"
      fill="currentColor"
    />
  </svg>
);

export type PasswordErrorProps =
  | {
      policy: 'zxcvbn';
      passwordInvalid: boolean;
      passwordScore: number;
      isPasswordBreached: boolean;
      // zxcvbn will return 0-1 warnings
      passwordWarning?: string;
      // zxcvbn will return 1-n suggestions
      passwordSuggestions: string[];
    }
  | {
      policy: 'luds';
      passwordInvalid: boolean;
      isPasswordBreached: boolean;
      missingCharacters: number;
      missingComplexity: number;
    }
  | { policy: 'notLoaded' };

const PasswordStrengthItem = ({ children, type }: { children: string; type: keyof typeof labels }) => {
  const { t } = useLingui();

  // notFulfilled and warning both have the same icon and color, they only differ in label
  const color =
    type === 'suggestion'
      ? undefined //
      : type === 'fulfilled'
        ? 'success'
        : 'destructive';

  const icon =
    type === 'suggestion' ? (
      <span role="presentation" className={styles.bullet}></span>
    ) : type === 'fulfilled' ? (
      <CheckIcon />
    ) : (
      <CrossIcon />
    );

  return (
    <Typography variant="helper" className={styles.item} color={color} aria-atomic>
      {icon}
      <span>
        <VisuallyHidden>{t(labels[type])}: </VisuallyHidden>
        {children}
      </span>
    </Typography>
  );
};

export const PasswordError = ({ bootstrap, ...props }: PasswordErrorProps & { bootstrap: BootstrapData }) => {
  const { t } = useLingui();
  const complexity = bootstrap.passwordConfig?.ludsComplexity ?? 0;
  const characterLength = bootstrap.passwordConfig?.ludsMinimumCount ?? 0;

  if (props.policy === 'notLoaded') {
    return null;
  }

  const { passwordInvalid, isPasswordBreached } = props;
  const passwordBreachedWarning = isPasswordBreached ? (
    <PasswordStrengthItem type="warning">
      {t({
        id: 'password.strengthError.breached',
        message:
          'This password may have been used on a different site that experienced a security issue. Please choose another password.',
      })}
    </PasswordStrengthItem>
  ) : null;

  if (props.policy === 'zxcvbn') {
    const { passwordScore, passwordWarning, passwordSuggestions } = props;

    // The list of warnings and suggestions above should be exhaustive, but we'll fall back to the untranslated string just in case.
    const translatedWarning = passwordWarning
      ? (warnings[passwordWarning as keyof typeof warnings] ?? passwordWarning)
      : null;
    const uniqueSuggestions = [...new Set(passwordSuggestions)];
    const translatedSuggestions = uniqueSuggestions.map(
      (suggestion) => suggestions[suggestion as keyof typeof suggestions] ?? suggestion,
    );

    return (
      <Column gap={1} aria-live="polite">
        <PasswordStrengthCheck score={passwordScore} />

        <VisuallyHidden>
          {passwordInvalid
            ? t({ id: 'password.strength.notAccepted', message: 'Password not accepted.' })
            : t({ id: 'password.strength.accepted', message: 'Password accepted.' })}
        </VisuallyHidden>

        <div>
          {translatedWarning && <PasswordStrengthItem type="warning">{t(translatedWarning)}</PasswordStrengthItem>}

          {translatedSuggestions.map((suggestion) => (
            <PasswordStrengthItem key={suggestion.id} type="suggestion">
              {t(suggestion)}
            </PasswordStrengthItem>
          ))}

          {passwordBreachedWarning}
        </div>
      </Column>
    );
  }

  const { missingCharacters, missingComplexity } = props;
  return (
    <div aria-live="polite">
      <VisuallyHidden>
        {passwordInvalid
          ? t({ id: 'password.strength.requirementsNotMet', message: 'Your password must meet all requirements.' })
          : t({ id: 'password.strength.accepted', message: 'Password accepted.' })}
      </VisuallyHidden>

      <PasswordStrengthItem type={missingCharacters === 0 ? 'fulfilled' : 'notFulfilled'}>
        {t({
          id: 'password.strengthError.minimumLength',
          message: plural(characterLength, {
            one: 'Must be at least # character long',
            other: 'Must be at least # characters long',
          }),
        })}
      </PasswordStrengthItem>

      <PasswordStrengthItem type={missingComplexity === 0 ? 'fulfilled' : 'notFulfilled'}>
        {t({
          id: 'password.strengthError.complexity',
          message: plural(complexity, {
            one: 'Must contain # of the following: uppercase letter, lowercase letter, number, symbol',
            other: 'Must contain # of the following: uppercase letter, lowercase letter, number, symbol',
          }),
        })}
      </PasswordStrengthItem>

      {passwordBreachedWarning}
    </div>
  );
};

export function getNewPasswordProps(bootstrap: BootstrapData, passwordPolicy: PasswordErrorProps['policy']) {
  if (passwordPolicy === 'notLoaded' || passwordPolicy === 'zxcvbn' || bootstrap.passwordConfig == null) {
    // passwordrules is currently only respected by password managers so this is a safe default
    // we don't set minLength to avoid blocking
    // https://developer.apple.com/password-rules/
    return {
      type: 'new' as const,
      passwordrules: 'allowed: unicode; minlength: 10',
    } satisfies Partial<PasswordInputProps>;
  }

  const { ludsComplexity, ludsMinimumCount } = bootstrap.passwordConfig;
  const required = ['special', 'digit', 'upper', 'lower'].slice(0, ludsComplexity);
  return {
    type: 'new' as const,
    minLength: ludsMinimumCount,
    passwordrules: `allowed: unicode; minlength: ${ludsMinimumCount}; ${required.map((r) => `required: ${r}`).join('; ')}`,
  } satisfies Partial<PasswordInputProps>;
}
