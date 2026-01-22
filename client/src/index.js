import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Lazy load Google OAuth to reduce initial bundle
const GoogleOAuthProvider = React.lazy(() => 
  import('@react-oauth/google').then(module => ({ 
    default: module.GoogleOAuthProvider 
  }))
);

const clientId = '567073435709-c1mccbial301f1u88ks693rbd532u96o.apps.googleusercontent.com';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Loading component for OAuth provider
const OAuthFallback = () => <div style={{ display: 'none' }} />;

root.render(
  <React.StrictMode>
    <Suspense fallback={<OAuthFallback />}>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    </Suspense>
  </React.StrictMode>
);

// Report web vitals for performance monitoring
reportWebVitals();
