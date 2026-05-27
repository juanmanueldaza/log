import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename="/log"> {/* "/log" for GitHub Pages subpath, "/" for custom domain */}
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
