import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './app/store.ts';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ErrorModalProvider } from './components/ui/ErrorModal.tsx';
import './index.css';
import "./i18n";
import App from './App.tsx';
import InitialLoader from './components/loader/spinnerLoader';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '850588370229-jtaul330kpqmi0m239itt4jrodshko78.apps.googleusercontent.com';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});


// Show initial loader immediately
// InitialLoader manages its own lifecycle (English -> Chinese -> Arabic -> Fade)
const loaderDiv = document.createElement('div');
loaderDiv.id = 'initial-loader-root';
document.body.appendChild(loaderDiv);
createRoot(loaderDiv).render(<InitialLoader />);

// Mount the main app
createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ErrorModalProvider>
            <App />
          </ErrorModalProvider>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  </GoogleOAuthProvider>
);