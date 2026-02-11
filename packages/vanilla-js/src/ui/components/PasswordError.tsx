import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { msg, plural } from '@lingui/core/macro';
import { BootstrapData } from '@stytch/core';
import styled from 'styled-components';

import { Flex } from './Flex';
import { Text } from './Text';

import { ErrorText } from './ErrorText';
import { PasswordStrengthCheck } from './PasswordStrengthCheck';

import { CheckIcon } from '../../assets/check';
import { CrossIcon } from '../../assets/cross';

import { useBootstrap as useB2CBootstrap } from '../b2c/utils';
import { useBootstrap as useB2BBootstrap } from '../b2b/utils';

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

// Styled to take up the same space as the CrossIcon on the warnings
const BulletPoint = styled.div`
  display: flex;
  justify-content: center;
  width: 16px;
  flex-shrink: 0;

  &::before {
    content: '•';
    font-size: ${({ theme }) => theme.typography.helper.fontSize};
    line-height: ${({ theme }) => theme.typography.helper.lineHeight};
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const CrossIconContainer = styled.div`
  flex-shrink: 0;
  padding-top: 2px;
`;

type PasswordErrorProps =
  | {
      passwordPolicy: 'zxcvbn';
      passwordScore: number;
      errorMessage: string;
      // zxcvbn will return 0-1 warnings
      passwordWarning?: string;
      // zxcvbn will return 1-n suggestions
      passwordSuggestions: string[];
      isPasswordBreached: boolean;
    }
  | {
      passwordPolicy: 'luds';
      missingCharacters: number;
      missingComplexity: number;
      isPasswordBreached: boolean;
    }
  | { passwordPolicy: 'none' };

const PasswordError = ({ bootstrap, ...props }: PasswordErrorProps & { bootstrap: BootstrapData }) => {
  const { t } = useLingui();
  const complexity = bootstrap.passwordConfig?.ludsComplexity ?? 0;
  const characterLength = bootstrap.passwordConfig?.ludsMinimumCount ?? 0;

  if (props.passwordPolicy === 'none') {
    return null;
  }

  const passwordBreachedMessage = props.isPasswordBreached && (
    <Flex gap={4}>
      <CrossIcon />
      <Text size="helper" color="error">
        {t({
          id: 'password.strengthError.breached',
          message:
            'This password may have been used on a different site that experienced a security issue. Please choose another password.',
        })}
      </Text>
    </Flex>
  );

  if (props.passwordPolicy === 'zxcvbn') {
    // The list of warnings and suggestions above should be exhaustive, but we'll fall back to the untranslated string just in case.
    const translatedWarning = props.passwordWarning
      ? (warnings[props.passwordWarning as keyof typeof warnings] ?? props.passwordWarning)
      : null;
    const uniqueSuggestions = [...new Set(props.passwordSuggestions)];
    const translatedSuggestions = uniqueSuggestions.map(
      (suggestion) => suggestions[suggestion as keyof typeof suggestions] ?? suggestion,
    );

    return (
      <>
        <PasswordStrengthCheck score={props.passwordScore} />
        {props.errorMessage && <ErrorText errorMessage={props.errorMessage} />}
        {translatedWarning && (
          <Flex gap={1} alignItems="flex-start">
            <CrossIconContainer>
              <CrossIcon />
            </CrossIconContainer>
            <Text size="helper" color="error">
              {t(translatedWarning)}
            </Text>
          </Flex>
        )}
        {translatedSuggestions.map((suggestion, index) => (
          <Flex key={index} gap={1} alignItems="flex-start">
            <BulletPoint />{' '}
            <Text size="helper" color="secondary">
              {t(suggestion)}
            </Text>
          </Flex>
        ))}
        {passwordBreachedMessage}
      </>
    );
  }
  return (
    <Flex direction="column" gap={4}>
      <Flex gap={4}>
        {props.missingCharacters === 0 ? <CheckIcon /> : <CrossIcon />}
        <Text size="helper" color={props.missingCharacters === 0 ? 'success' : 'error'}>
          {t({
            id: 'password.strengthError.minimumLength',
            message: plural(characterLength, {
              one: 'Must be at least # character long',
              other: 'Must be at least # characters long',
            }),
          })}
        </Text>
      </Flex>
      <Flex gap={4}>
        {props.missingComplexity === 0 ? <CheckIcon /> : <CrossIcon />}
        <Text size="helper" color={props.missingComplexity === 0 ? 'success' : 'error'}>
          {t({
            id: 'password.strengthError.complexity',
            message: plural(complexity, {
              one: 'Must contain # of the following: uppercase letter, lowercase letter, number, symbol',
              other: 'Must contain # of the following: uppercase letter, lowercase letter, number, symbol',
            }),
          })}
        </Text>
      </Flex>
      {passwordBreachedMessage}
    </Flex>
  );
};

export const PasswordB2CError = (props: PasswordErrorProps) => {
  const { bootstrap } = useB2CBootstrap();
  return <PasswordError {...props} bootstrap={bootstrap} />;
};

export const PasswordB2BError = (props: PasswordErrorProps) => {
  const bootstrap = useB2BBootstrap();
  return <PasswordError {...props} bootstrap={bootstrap} />;
};
