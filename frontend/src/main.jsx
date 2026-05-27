import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
          <ErrorBoundary>
            <Toaster position="top-right" richColors closeButton />
            <App />
          </ErrorBoundary>
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
