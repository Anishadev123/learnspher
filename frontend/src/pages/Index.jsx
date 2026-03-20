import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "axios";
import NoteViewer from "../components/NoteViewer";

const Index = () => {
  const { materialId } = useParams(); // ✅ from /course/:materialId
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const token = await user.getIdToken(true);

        // ✅ Fetch all materials for this user
        const res = await axios.get("http://localhost:5000/api/study/my-materials", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Route materialId:", materialId);
        console.log("📦 All fetched material IDs:", res.data.map((m) => m._id));

        // ✅ Match material by ID (normalize MongoDB _id)
        const material = res.data.find(
          (m) => (m._id?.$oid || m._id?.toString?.() || m._id) === materialId
        );

        if (!material) {
          console.error("❌ Material not found for ID:", materialId);
          setError("Material not found");
          setLoading(false);
          return;
        }

        console.log("✅ Found Material:", material);

        // ✅ Format data for NoteViewer
        const formattedData = {
          subject: material.subject,
          goal: material.goal,
          academicLevel: material.academicLevel,
          difficulty: material.difficulty,
          output: {
            notes: material.output?.notes || "",
            diagram: material.output?.diagram || "",
            courseOutline: material.output?.courseOutline || [],
            flashcards: material.output?.flashcards || [],
            quiz: material.output?.quiz || [],
          },
        };

        setCourseData(formattedData);
      } catch (err) {
        console.error("🔥 Error fetching material:", err);
        setError("Failed to load study material");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId]);

  if (loading) return <p>Loading study material...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!courseData) return <p>No material found.</p>;

  return <NoteViewer data={courseData} />;
};

export default Index;
