import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename="/"> {/* Ajusta según el valor de base */}
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
