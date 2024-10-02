// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme"; // 导入主题
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import './i18n';

const root = ReactDOM.createRoot(document.getElementById("root"));

// 引入 Google Fonts
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/css2?family=Lobster&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
