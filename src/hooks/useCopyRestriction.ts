import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';

export const useCopyRestriction = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const copyAllowed = settings.allow_copy_function;

    if (!copyAllowed) {
      // Add CSS to prevent text selection
      const style = document.createElement('style');
      style.id = 'copy-restriction-styles';
      style.textContent = `
        .copy-restricted {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .copy-restricted * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `;
      document.head.appendChild(style);

      // Add event listeners to prevent copying
      const preventCopy = (e: Event) => {
        e.preventDefault();
        return false;
      };

      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      const preventKeyboardShortcuts = (e: KeyboardEvent) => {
        // Prevent Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+V, Ctrl+S, F12, etc.
        if (
          (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'x' || e.key === 'v' || e.key === 's')) ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
          return false;
        }
      };

      document.addEventListener('copy', preventCopy);
      document.addEventListener('cut', preventCopy);
      document.addEventListener('contextmenu', preventContextMenu);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('selectstart', preventCopy);
      document.addEventListener('dragstart', preventCopy);

      return () => {
        // Cleanup: remove styles and event listeners
        const existingStyle = document.getElementById('copy-restriction-styles');
        if (existingStyle) {
          existingStyle.remove();
        }

        document.removeEventListener('copy', preventCopy);
        document.removeEventListener('cut', preventCopy);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
        document.removeEventListener('selectstart', preventCopy);
        document.removeEventListener('dragstart', preventCopy);
      };
    } else {
      // Remove restrictions if copy is allowed
      const existingStyle = document.getElementById('copy-restriction-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [settings]);

  return {
    copyAllowed: settings?.allow_copy_function ?? true,
    restrictionClass: settings?.allow_copy_function === false ? 'copy-restricted' : '',
  };
};