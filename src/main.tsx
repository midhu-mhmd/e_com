import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './app/store.ts';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ErrorModalProvider } from './components/ui/ErrorModal.tsx';
import './index.css';
import "./i18n";
import App from './App.tsx';

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

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ErrorModalProvider>
          <App />
        </ErrorModalProvider>
      </ToastProvider>
    </QueryClientProvider>
  </Provider>
);