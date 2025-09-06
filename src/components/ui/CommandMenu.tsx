import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { routeTitles, prefetchRoute } from '@/routes';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleDarkMode, reducedMotion, setReducedMotion } = useTheme();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    setOpen(false);
    try {
      const raw = localStorage.getItem('recent-routes');
      const recent: string[] = raw ? JSON.parse(raw) : [];
      const next = [location.pathname, ...recent.filter(p => p !== location.pathname)].slice(0, 8);
      localStorage.setItem('recent-routes', JSON.stringify(next));
    } catch {}
  }, [location.pathname]);

  const entries = Object.entries(routeTitles);
  let recent: string[] = [];
  try {
    recent = JSON.parse(localStorage.getItem('recent-routes') || '[]');
  } catch {}

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search commands and pages…" autoFocus />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {recent.length > 0 && (
          <CommandGroup heading="Recent">
            {recent.map((path) => (
              <CommandItem
                key={`recent-${path}`}
                value={`${routeTitles[path] || path} ${path}`}
                onMouseEnter={() => prefetchRoute(path)}
                onSelect={() => navigate(path)}
              >
                {routeTitles[path] || path}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Navigate">
          {entries.map(([path, title]) => (
            <CommandItem
              key={path}
              value={`${title} ${path}`}
              onMouseEnter={() => prefetchRoute(path)}
              onSelect={() => navigate(path)}
            >
              {title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => {
            if ('startViewTransition' in document) {
              // @ts-ignore experimental API
              document.startViewTransition(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}>
            Scroll to top
          </CommandItem>
          <CommandItem onSelect={() => toggleDarkMode()}>
            Toggle dark mode
          </CommandItem>
          <CommandItem onSelect={() => setReducedMotion(!reducedMotion)}>
            {reducedMotion ? 'Enable motion effects' : 'Reduce motion'}
          </CommandItem>
          <CommandItem onSelect={() => navigate('/settings')}>
            Open Settings
          </CommandItem>
          <CommandItem onSelect={async () => {
            const dp: any = (window as any).__deferredPrompt;
            if (dp) {
              await dp.prompt();
              await dp.userChoice;
            } else {
              toast('Install prompt not available');
            }
          }}>
            Install App
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default CommandMenu;

