import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename="/"> {/* Asegúrate de que solo haya un BrowserRouter */}
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
