import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RouterProvider } from './router/RouterContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <RouterProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </RouterProvider>
);
