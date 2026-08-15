import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import archive from "../app/data/archive.json";
import { BubbleArchive, type Archive } from "./BubbleArchive";
import "./styles.css";
import "./audio.css";
import "./bubble.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BubbleArchive data={archive as Archive} />
  </StrictMode>,
);
