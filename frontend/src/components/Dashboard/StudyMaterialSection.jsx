"use client";

import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import StudyMaterialCard from "./StudyMaterialCard";
import { getAuth } from "firebase/auth";
import axios from "axios";
import "./StudyMaterialSection.css";

export default function StudyMaterialSection() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch materials from backend (MongoDB)
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

      console.log("Fetched materials:", res.data);

      // ✅ Include subject & goal properly
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
        <h2>Your Study Material</h2>
        <button className="refresh-btn" onClick={fetchMaterials} disabled={loading}>
          <RotateCcw size={18} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="materials-grid">
        {materials.length === 0 ? (
          <p>No study materials found.</p>
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
    </section>
  );
}
