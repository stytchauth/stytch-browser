import classNames from 'classnames';
import React, { KeyboardEventHandler, ReactNode } from 'react';

import styles from './Button.module.css';
import { CircularProgress } from './CircularProgress';

export type ButtonProps = {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  children: ReactNode;

  /**
   * Button is full width and content is centered
   * @default true
   */
  block?: boolean;

  icon?: ReactNode;

  /** If true, display a spinner and disables the button */
  loading?: boolean;
  disabled?: boolean;

  /**
   * Unlike HTML <button> we deliberately set the default to button to
   * avoid bugs where buttons inadvertently submit forms
   * @default 'button'
   **/
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  id?: string;
};

export function buttonClassNames({ variant, block = true }: Pick<ButtonProps, 'variant' | 'block'>) {
  return classNames(styles.button, styles[variant], {
    [styles.block]: block,
  });
}

// Base renderer for both <a> and <button> based <Button>s
const baseButton = (props: ButtonProps & { as?: string }) => {
  const { as, children, icon, onClick, loading, disabled = loading, block, variant, ...otherProps } = props;
  const Element = as as 'button';

  let buttonContent = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (loading) {
    buttonContent = <CircularProgress size={20} />;
  }

  return (
    <Element className={buttonClassNames(props)} onClick={onClick} disabled={disabled} {...otherProps}>
      {buttonContent}
    </Element>
  );
};

const Button = (props: ButtonProps) =>
  baseButton({
    type: 'button',
    as: 'button',
    ...props,
  });

export default Button;

// Deriving this from ButtonProps is not very neat, but ButtonAnchor is not frequently used
export type ButtonAnchorProps = Omit<ButtonProps, 'type' | 'as'> & {
  href: string;
  download?: string;
  target?: string;
  rel?: string;
};

export const ButtonAnchor = (props: ButtonAnchorProps) =>
  baseButton({
    ...props,
    // Links don't fire click event on space while buttons do, so we implement that ourselves for these
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/button_role#accessibility_concerns
    onKeyDown: (evt) => {
      props.onKeyDown?.(evt);
      if (evt.defaultPrevented) return;
      if (evt.key === ' ') evt.currentTarget.click();
    },
    as: 'a',
  });
