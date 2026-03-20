"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useCredits } from "../../context/CreditsContext";
import { getAuth } from "firebase/auth";
import "./CreateStudyPlanModal.css";
import axios from "axios";

export default function CreateStudyPlanModal({ isOpen, onClose, onSubmit }) {
  const { hasCreditsAvailable, deductCredit, availableCredits } = useCredits();
  const [idToken, setIdToken] = useState(null);

  // ✅ Get Firebase token on mount
  useEffect(() => {
    const auth = getAuth();
    auth.currentUser?.getIdToken().then((token) => {
      setIdToken(token);
    });
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    goal: "",
    academicLevel: "",
    difficulty: "",
    language: "",
    learningStyle: "",
    keywords: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.goal.trim()) newErrors.goal = "Goal is required";
    if (!formData.academicLevel.trim())
      newErrors.academicLevel = "Academic level is required";
    if (!formData.difficulty.trim())
      newErrors.difficulty = "Difficulty is required";
    if (!formData.language.trim()) newErrors.language = "Language is required";
    if (!formData.learningStyle.trim())
      newErrors.learningStyle = "Learning style is required";
    if (!formData.keywords.trim()) newErrors.keywords = "Keywords are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Same backend connection logic as InputForm
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!idToken) {
      console.error("Missing ID token. User may not be authenticated.");
      return;
    }

    const data = {
      ...formData,
      keywords: formData.keywords.split(",").map((kw) => kw.trim()),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/study/create",
        data,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      console.log("✅ Success:", response.data);
      deductCredit();
      onSubmit?.(response.data);
      handleClose();
    } catch (error) {
      console.error(
        "❌ Error submitting form:",
        error.response?.data || error.message
      );
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      subject: "",
      goal: "",
      academicLevel: "",
      difficulty: "",
      language: "",
      learningStyle: "",
      keywords: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Study Plan</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {!hasCreditsAvailable && (
          <div className="credit-warning">
            <AlertCircle size={20} />
            <span>
              No credits available. Upgrade your plan to create more study
              materials.
            </span>
          </div>
        )}

        {errors.submit && (
          <div className="credit-warning">
            <AlertCircle size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* ✅ Same UI maintained */}
        <form onSubmit={handleSubmit} className="study-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter study plan title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
              disabled={!hasCreditsAvailable}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="e.g., Mathematics, Physics, History"
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? "input-error" : ""}
              disabled={!hasCreditsAvailable}
            />
            {errors.subject && (
              <span className="error-message">{errors.subject}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="goal">Goal</label>
            <input
              type="text"
              id="goal"
              name="goal"
              placeholder="e.g., Pass exam, Master concepts, Quick review"
              value={formData.goal}
              onChange={handleChange}
              className={errors.goal ? "input-error" : ""}
              disabled={!hasCreditsAvailable}
            />
            {errors.goal && (
              <span className="error-message">{errors.goal}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="academicLevel">Academic Level</label>
              <input
                type="text"
                id="academicLevel"
                name="academicLevel"
                placeholder="e.g., High School, College, University"
                value={formData.academicLevel}
                onChange={handleChange}
                className={errors.academicLevel ? "input-error" : ""}
                disabled={!hasCreditsAvailable}
              />
              {errors.academicLevel && (
                <span className="error-message">{errors.academicLevel}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <input
                type="text"
                id="difficulty"
                name="difficulty"
                placeholder="e.g., Beginner, Intermediate, Advanced"
                value={formData.difficulty}
                onChange={handleChange}
                className={errors.difficulty ? "input-error" : ""}
                disabled={!hasCreditsAvailable}
              />
              {errors.difficulty && (
                <span className="error-message">{errors.difficulty}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                placeholder="e.g., English, Spanish, French"
                value={formData.language}
                onChange={handleChange}
                className={errors.language ? "input-error" : ""}
                disabled={!hasCreditsAvailable}
              />
              {errors.language && (
                <span className="error-message">{errors.language}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="learningStyle">Learning Style</label>
              <input
                type="text"
                id="learningStyle"
                name="learningStyle"
                placeholder="e.g., Visual, Auditory, Reading"
                value={formData.learningStyle}
                onChange={handleChange}
                className={errors.learningStyle ? "input-error" : ""}
                disabled={!hasCreditsAvailable}
              />
              {errors.learningStyle && (
                <span className="error-message">{errors.learningStyle}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="keywords">Keywords</label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              placeholder="e.g., algebra, calculus, equations (comma separated)"
              value={formData.keywords}
              onChange={handleChange}
              className={errors.keywords ? "input-error" : ""}
              disabled={!hasCreditsAvailable}
            />
            {errors.keywords && (
              <span className="error-message">{errors.keywords}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={!hasCreditsAvailable}
          >
            {hasCreditsAvailable
              ? `Create Study Plan (${availableCredits} credits left)`
              : "No Credits Available"}
          </button>
        </form>
      </div>
    </div>
  );
}
