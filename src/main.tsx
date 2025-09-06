import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import { toast } from 'sonner'
import { initAnalytics } from '@/lib/analytics'

createRoot(document.getElementById("root")!).render(<App />);

// PWA update & offline notifications
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    toast('Update available', {
      action: {
        label: 'Update',
        onClick: () => updateSW(true),
      },
      description: 'A new version is ready to install',
    });
  },
  onOfflineReady() {
    toast.success('App is ready to work offline');
  },
});

initAnalytics();
