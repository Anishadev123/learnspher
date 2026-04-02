import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import "./DiagramViewer.css";

// ✅ Initialize Mermaid once (not inside the component)
mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#10B981",
    primaryTextColor: "#1e293b",
    primaryBorderColor: "#059669",
    lineColor: "#64748b",
    secondaryColor: "#34D399",
    tertiaryColor: "#047857",
    background: "#ffffff",
    mainBkg: "#ecfdf5",
    secondBkg: "#d1fae5",
    tertiaryBkg: "#a7f3d0",
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
