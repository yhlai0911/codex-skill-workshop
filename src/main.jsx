import React from "react";
import { createRoot } from "react-dom/client";
import CodexSkillWorkshopSite from "../codex_skill_workshop_interactive_site.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CodexSkillWorkshopSite />
  </React.StrictMode>
);
