import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import "./DiagramViewer.css";

// ✅ Initialize Mermaid once (not inside the component)
mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#3B82F6",
    primaryTextColor: "#1e293b",
    primaryBorderColor: "#2563EB",
    lineColor: "#64748b",
    secondaryColor: "#8B5CF6",
    tertiaryColor: "#10B981",
    background: "#ffffff",
    mainBkg: "#EFF6FF",
    secondBkg: "#F3E8FF",
    tertiaryBkg: "#D1FAE5",
    fontSize: "16px",
  },
});

const DiagramViewer = ({ diagram }) => {
  const diagramRef = useRef(null);

  useEffect(() => {
    if (!diagramRef.current || !diagram) return;

    const renderDiagram = async () => {
      try {
        const uniqueId = `mermaid-${Date.now()}`; // required unique ID
        const { svg } = await mermaid.render(uniqueId, diagram);
        diagramRef.current.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid Render Error:", err);
        diagramRef.current.innerHTML = `<p class="diagram-error">Diagram failed to render: ${err.message}</p>`;
      }
    };

    renderDiagram();
  }, [diagram]);

  return (
    <div className="diagram-container">
      <div className="diagram-wrapper" ref={diagramRef}></div>
    </div>
  );
};

export default DiagramViewer;
