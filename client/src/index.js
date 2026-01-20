import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = '567073435709-c1mccbial301f1u88ks693rbd532u96o.apps.googleusercontent.com';

// // ✅ Fix 1: Set correct base URL and token automatically
// axios.defaults.baseURL = 'http://localhost:3000'; // Your Express backend
// axios.defaults.withCredentials = true;

// axios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     console.log('🔗 API Request:', config.baseURL + config.url);
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
