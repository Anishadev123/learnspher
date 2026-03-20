"use client";

import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./StudyMaterialCard.css";

export default function StudyMaterialCard({ material, onDelete }) {
  const navigate = useNavigate();

  // ✅ Normalize MongoDB ID safely
  const materialId =
    material._id?.$oid || material._id || material.id || "";

  const handleView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navigating to:", materialId);

    if (!materialId) {
      console.error("❌ No valid material ID found.");
      return;
    }

    // ✅ Navigate with normalized ID
    navigate(`/study-material/${materialId}`);
  };

  return (
    <div className="study-card">
      <div className="card-header">
        <div className="card-icon">📚</div>
        <span
          className={`status-badge status-${
            material.status?.toLowerCase() || "initialized"
          }`}
        >
          {material.status || "Initialized"}
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{material.title}</h3>

        {/* ✅ Show normalized ID */}
        <p className="material-id">ID: {materialId}</p>

        <div className="card-details">
          <p><strong>Subject:</strong> {material.subject || "N/A"}</p>
          <p><strong>Goal:</strong> {material.goal || "N/A"}</p>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn-view" onClick={handleView}>
          <Eye size={16} /> View
        </button>
        <button className="btn-delete" onClick={onDelete}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
