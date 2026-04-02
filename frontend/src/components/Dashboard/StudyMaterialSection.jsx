"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StudyMaterialCard from "./StudyMaterialCard";
import { getAuth } from "firebase/auth";
import axios from "axios";
import "./StudyMaterialSection.css";

export default function StudyMaterialSection() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken(true);

      const res = await axios.get("http://localhost:5000/api/study/my-materials", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = res.data.map((item) => ({
        id: item._id?.$oid || item._id,
        title: item.title,
        icon: "📚",
        status: "Ready",
        subject: item.subject,
        goal: item.goal,
      }));

      setMaterials(formatted);
    } catch (err) {
      console.error("Error fetching study materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <section className="study-material-section">
      <div className="section-header">
        <div className="section-title-group">
          <h2>Your Study Material</h2>
          <span className="material-count">{materials.length} items</span>
        </div>
        <button
          className="ai-studio-btn"
          onClick={() => navigate("/chat-with-pdf")}
        >
          <BrainCircuit size={18} />
          AI Studio
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={24} className="spin-icon" />
          <p>Loading your materials...</p>
        </div>
      ) : (
        <div className="materials-grid">
          {materials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No study materials yet</h3>
              <p>Create your first study plan to get started!</p>
            </div>
          ) : (
            materials.map((material) => (
              <StudyMaterialCard
                key={material.id}
                material={material}
                onDelete={() => handleDelete(material.id)}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}
