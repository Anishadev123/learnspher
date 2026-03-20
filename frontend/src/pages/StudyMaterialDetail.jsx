"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { useCredits } from "../context/CreditsContext";
import { getAuth } from "firebase/auth";
import axios from "axios";
import "../style/StudyMaterialDetail.css";

export default function StudyMaterialDetail() {
  const { materialId } = useParams(); // ✅ from route param
  const navigate = useNavigate();
  const { hasCreditsAvailable, deductCredit, availableCredits } = useCredits();
  const [materialData, setMaterialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTypes, setGeneratedTypes] = useState({});

  // ✅ Fetch single material by ID
  const fetchMaterial = async () => {
    try {
      setIsLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken(true);

      const res = await axios.get("http://localhost:5000/api/study/my-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("MaterialId from URL:", materialId);
      console.log("Fetched IDs:", res.data.map((m) => m._id));

      // ✅ Normalize MongoDB ID formats
      const material = res.data.find(
        (m) => (m._id?.$oid || m._id?.toString?.() || m._id) === materialId
      );

      if (!material) {
        console.error("Material not found for ID:", materialId);
        alert("Material not found. Please return to dashboard.");
        return;
      }

      setMaterialData({
        id: material._id?.$oid || material._id,
        title: material.title,
        subject: material.subject,
        totalChapters: material.totalChapters || material.output?.courseOutline?.length || 0,
        progress: material.progress || 0,
        createdDate: material.createdAt || "",
        goal: material.goal,
      });
    } catch (err) {
      console.error("Error fetching material:", err);
      alert("Failed to fetch material. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterial();
  }, [materialId]);

  // ✅ Generate feature
  const handleGenerate = (type) => {
    if (!hasCreditsAvailable) {
      alert("No credits available. Please upgrade to generate more study materials.");
      return;
    }

    setIsLoading(true);
    const creditUsed = deductCredit();

    if (!creditUsed) {
      alert("Failed to use credit. Please try again.");
      setIsLoading(false);
      return;
    }

    // Simulate generation delay
    setTimeout(() => {
      setGeneratedTypes((prev) => ({
        ...prev,
        [type]: true,
      }));
      console.log(
        `[v0] Generated ${type} for material ${materialId}. Credits left: ${
          availableCredits - 1
        }`
      );
      setIsLoading(false);
    }, 1500);
  };

  const handleRefresh = () => {
    fetchMaterial();
  };

  if (!materialData) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading material...</p>;
  }

  return (
    <div className="study-detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="header-title">
            <h1>{materialData.title}</h1>
            <p className="header-subtitle">{materialData.subject}</p>
          </div>
        </div>
        <button className="refresh-button" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw size={20} className={isLoading ? "spinning" : ""} />
          Refresh
        </button>
      </div>

      {!hasCreditsAvailable && (
        <div className="credit-warning-banner">
          <AlertCircle size={20} />
          <span>
            No credits available. Upgrade your plan to generate more study materials.
          </span>
        </div>
      )}

      {/* Info Card */}
      <div className="info-card">
        <div className="info-item">
          <div className="info-icon">
            <BookOpen size={24} />
          </div>
          <div className="info-content">
            <span className="info-label">Total Chapters</span>
            <span className="info-value">{materialData.totalChapters}</span>
          </div>
        </div>
        <div className="info-divider"></div>
      </div>

      {/* Material Types */}
      <div className="material-section">
        <h2 className="section-title">Study Material</h2>
        <p className="section-subtitle">Generate your personalized study tools below.</p>

        <div className="material-grid">
          {/* Notes */}
          <MaterialTypeCard
            title="Notes/Chapters"
            type="notes"
            description="Read notes to prepare for your exams and understand concepts deeply."
            generated={generatedTypes.notes}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            hasCreditsAvailable={hasCreditsAvailable}
            materialId={materialData.id} // ✅ pass materialId
          />

          {/* Flashcard */}
          <MaterialTypeCard
            title="Flashcard"
            type="flashcard"
            description="Flashcards help you remember the concepts and key points effectively."
            generated={generatedTypes.flashcard}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            hasCreditsAvailable={hasCreditsAvailable}
            materialId={materialData.id} // ✅ pass materialId
          />

          {/* Quiz */}
          <MaterialTypeCard
            title="Quiz"
            type="quiz"
            description="Test your knowledge and identify areas for improvement."
            generated={generatedTypes.quiz}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            hasCreditsAvailable={hasCreditsAvailable}
            materialId={materialData.id} // ✅ pass materialId
          />
        </div>
      </div>
    </div>
  );
}

// ✅ Reusable MaterialTypeCard (no type in route)
function MaterialTypeCard({
  title,
  type,
  description,
  generated,
  onGenerate,
  isLoading,
  hasCreditsAvailable,
  materialId, // ✅ receives material ID
}) {
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!materialId) {
      console.error("❌ No materialId passed to MaterialTypeCard");
      return;
    }

    // ✅ Only navigate using the ID (no type)
    navigate(`/course/${materialId}`);
  };

  return (
    <div className="material-type-card">
      <div className="card-top">
        <div className="material-icon">{title.charAt(0)}</div>
        <button
          className="generate-badge"
          onClick={() => onGenerate(type)}
          disabled={isLoading || !hasCreditsAvailable}
        >
          {isLoading ? "Generating..." : generated ? "Generated" : "Generate"}
        </button>
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <button
        className="generate-button"
        onClick={handleSubmit}
        disabled={isLoading || !hasCreditsAvailable}
      >
        {generated ? `View ${title}` : `View ${title}`}
      </button>
    </div>
  );
}
