import { useState } from 'react';

export type ToggleState = {
  isOpen: boolean;
  toggle(): void;
  open(): void;
  close(): void;
};

export const useToggleState = (initialState?: boolean): ToggleState => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState || false);

  const toggle = () => setIsOpen((prev) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    close,
    isOpen,
    open,
    toggle,
  };
};
