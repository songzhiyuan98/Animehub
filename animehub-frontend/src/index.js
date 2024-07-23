// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // 导入主题
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme = {theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
