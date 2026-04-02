"use client";

import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./StudyMaterialCard.css";

export default function StudyMaterialCard({ material, onDelete }) {
  const navigate = useNavigate();

  const materialId =
    material._id?.$oid || material._id || material.id || "";

  const handleView = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!materialId) {
      console.error("No valid material ID found.");
      return;
    }

    navigate(`/study-material/${materialId}`);
  };

  return (
    <div className="study-card">
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon">📚</div>
          <h3 className="card-title">{material.title}</h3>
        </div>
        <span
          className={`status-badge status-${
            material.status?.toLowerCase() || "initialized"
          }`}
        >
          {material.status || "Initialized"}
        </span>
      </div>

      <div className="card-body">
        <div className="card-details">
          <div className="detail-row">
            <span className="detail-label">Subject</span>
            <span className="detail-value">{material.subject || "N/A"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Goal</span>
            <span className="detail-value">{material.goal || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn-view" onClick={handleView}>
          <Eye size={15} /> View
        </button>
        <button className="btn-delete" onClick={onDelete}>
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  );
}
