import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "./app/AppShell";
import "./design-system/tokens.css";
import "./styles/app.css";

createRoot(document.getElementById("root")!).render(<StrictMode><AppShell initialPath={window.location.pathname.replace(/^\/v2/, "") || "/home"} /></StrictMode>);
