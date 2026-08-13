import "@/styles/style.css";
import "react-toastify/dist/ReactToastify.css";

import { Buffer } from "buffer";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { initializeI18n } from "@/lib/i18n";

(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element was not found.");
}

void initializeI18n()
  .catch((error) => {
    console.error("Localization could not be initialized.", error);
  })
  .finally(() => {
    ReactDOM.createRoot(rootElement).render(<App />);
  });
