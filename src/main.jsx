
  import { createRoot } from "react-dom/client";
  import App from "./app/App.jsx";
  import "./styles/index.css";

  // Development helper: inject a valid test JWT for `mmn@gmail.com` (user id 17)
  // This lets the UI load customer-specific endpoints automatically during local dev.
  try {
      if ((import.meta as any).env && (import.meta as any).env.MODE === 'development') {
        const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoibW1uQGdtYWlsLmNvbSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc3MTIyMDM4MiwiZXhwIjoxNzcxODI1MTgyfQ.i5iqOpj6p_e5dW4mzd98FcUh7m1sigO465gaollbeYM';
        if (!localStorage.getItem('authToken')) {
          localStorage.setItem('authToken', TEST_TOKEN);
          console.info('Dev: injected authToken for mmn@gmail.com');
        }
      }
  } catch (e) {
    // ignore errors in environments where import.meta isn't available
  }

  createRoot(document.getElementById("root")).render(<App />);
  


