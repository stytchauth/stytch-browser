import { createRoot } from 'react-dom/client';

if (!import.meta.env.VITE_APP) {
  throw new Error('Missing VITE_APP env var - Run this command with VITE_APP=<name of app under src>');
}

const { app } = await import(`./src/${import.meta.env.VITE_APP}`);

createRoot(document.getElementById('root')!).render(app);
