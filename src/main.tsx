import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './app/store.ts';
import { ToastProvider } from './components/ui/Toast.tsx';
import { ErrorModalProvider } from './components/ui/ErrorModal.tsx';
import './index.css';
import "./i18n";
import App from './App.tsx';
import InitialLoader from './components/loader/spinnerLoader';

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
const loaderDiv = document.createElement('div');
loaderDiv.id = 'initial-loader-root';
document.body.appendChild(loaderDiv);
createRoot(loaderDiv).render(<InitialLoader />);

// Mount the main app
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

// Remove/hide the loader after React is ready
setTimeout(() => {
  const loader = document.getElementById('initial-loader-root');
  if (loader) loader.style.opacity = '0';
  setTimeout(() => {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  }, 400);
}, 2000);