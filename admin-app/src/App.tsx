import { useEffect } from "react";
import "./App.css";

export default function App() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("matobev_admin_session");
      if (!raw) {
        window.location.href = "/login";
        return;
      }
      const sess = JSON.parse(raw);
      const now = Date.now();
      if (!sess?.token || !sess?.exp || now > sess.exp) {
        localStorage.removeItem("matobev_admin_session");
        window.location.href = "/login";
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/login";
    }
  }, []);
  return null;
}
