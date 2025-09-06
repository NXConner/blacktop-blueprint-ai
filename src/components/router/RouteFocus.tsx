import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { routeTitles } from '@/routes';

export function RouteFocus() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    // Move focus to main content for screen readers/keyboard users
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      (main as HTMLElement).focus();
      // Remove temporary tabindex after focus
      const timeout = setTimeout(() => main.removeAttribute('tabindex'), 100);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname]);

  useEffect(() => {
    const baseTitle = 'ISAC OS';
    const title = routeTitles[location.pathname] || 'App';
    document.title = `${title} • ${baseTitle}`;
  }, [location.pathname]);

  return null;
}