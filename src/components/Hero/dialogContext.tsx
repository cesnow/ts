import { ReactNode } from 'react';

export function useDialog() {
  const openDialog = (content: ReactNode) => {
    const event = new CustomEvent('open-dialog', { detail: content });
    window.dispatchEvent(event);
  };

  const closeDialog = () => {
    window.dispatchEvent(new Event('close-dialog'));
  };

  return { openDialog, closeDialog };
}
