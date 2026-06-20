import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { LanguageProvider } from './i18n/LanguageContext';
import router from './router';

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
