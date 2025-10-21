import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// إخفاء أخطاء الإضافات من Console
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    args[0].includes('Could not establish connection')
  ) {
    return; // تجاهل أخطاء الإضافات
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
