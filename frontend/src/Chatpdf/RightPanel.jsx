"use client";

import { useState } from "react";
import "./RightPanel.css";
import {
  Volume2,
  BookOpen,
  BarChart3,
  FileText,
  Edit3,
  ChevronDown,
} from "lucide-react";

export default function RightPanel({ activeSource }) {
  const [expandedSection, setExpandedSection] = useState(null);

  // Tool states
  const [loading, setLoading] = useState(false);
  const [studyGuide, setStudyGuide] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Modal state
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

  // 🔊 AUDIO
  const handleAudio = async () => {
    if (!activeSource) return alert("Select a source first!");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/tools/audio/${activeSource._id}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (data.summary) {
        const utterance = new SpeechSynthesisUtterance(data.summary);
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate audio");
    } finally {
      setLoading(false);
    }
  };

  // 📘 STUDY GUIDE
  const handleStudy = async () => {
    if (!activeSource) return alert("Select a source first!");

    if (studyGuide) {
      setIsStudyModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/tools/study/${activeSource._id}`,
        { method: "POST" }
      );
      const data = await res.json();

      setStudyGuide(data.guide);
      setIsStudyModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate study guide");
    } finally {
      setLoading(false);
    }
  };

  // 📊 REPORT
  const handleReport = async () => {
    if (!activeSource) return alert("Select a source first!");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/tools/report/${activeSource._id}`
      );
      const data = await res.json();

      setReportData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // 📄 PDF
  const handleSummaryPDF = () => {
    if (!activeSource) return alert("Select a source first!");
    window.open(
      `http://localhost:5000/api/tools/summary-pdf/${activeSource._id}`,
      "_blank"
    );
  };

  const features = [
    {
      id: "audio",
      icon: Volume2,
      label: "Audio Overview",
      description: "Listen to document summary",
      action: handleAudio,
      content: null,
    },
    {
      id: "guide",
      icon: BookOpen,
      label: "Study Guide",
      description: "Key concepts & topics",
      action: handleStudy,
      content: null,
    },
    {
      id: "reports",
      icon: BarChart3,
      label: "Reports",
      description: "Analytics & insights",
      action: handleReport,
      content: reportData ? (
        <div className="report-content-3">
          <p><strong>Words:</strong> {reportData.wordCount}</p>
          <p><strong>Characters:</strong> {reportData.characterCount}</p>
          <p><strong>Reading Time:</strong> {reportData.readingTime} min</p>
          <p><strong>Difficulty:</strong> {reportData.difficulty}</p>
        </div>
      ) : null,
    },
    {
      id: "summary",
      icon: FileText,
      label: "Summary PDF",
      description: "Downloadable summary",
      action: handleSummaryPDF,
      content: null,
    },
  ];

  return (
    <>
      <div className="right-panel-3">
        <div className="panel-header-3">
          <h2 className="panel-title-3">Learning Tools</h2>
        </div>

        <div className="features-grid-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isExpanded = expandedSection === feature.id;

            return (
              <div
                key={feature.id}
                className={`feature-card-3 ${
                  isExpanded ? "expanded-3" : ""
                }`}
              >
                <div
                  className="feature-header-3"
                  onClick={() =>
                    setExpandedSection(isExpanded ? null : feature.id)
                  }
                >
                  <Icon size={24} className="feature-icon-3" />
                  <div className="feature-text-3">
                    <p className="feature-label-3">{feature.label}</p>
                    <p className="feature-description-3">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`chevron-3 ${
                      isExpanded ? "rotated-3" : ""
                    }`}
                    size={20}
                  />
                </div>

                {isExpanded && (
                  <div className="feature-content-3">
                    {!feature.content && !loading && (
                      <>
                        <p>
                          {activeSource
                            ? "Ready to generate."
                            : "Select a source first."}
                        </p>
                        <button
                          className="feature-btn-3"
                          onClick={feature.action}
                          disabled={!activeSource}
                        >
                          Generate
                        </button>
                      </>
                    )}

                    {loading && <p>Generating...</p>}

                    {feature.content && (
                      <>
                        {feature.content}
                        <button
                          className="regen-btn-3"
                          onClick={feature.action}
                        >
                          Regenerate
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* NOTES */}
        <div className="notes-section-3">
          <div className="notes-header-3">
            <Edit3 size={20} />
            <h3>Notes</h3>
          </div>

          <textarea
            className="notes-textarea-3"
            placeholder="Take notes while studying..."
          />

          <button className="save-notes-btn-3">Save Notes</button>
        </div>
      </div>

      {/* 📘 STUDY GUIDE MODAL */}
      {isStudyModalOpen && (
        <div
          className="modal-overlay-3"
          onClick={() => setIsStudyModalOpen(false)}
        >
          <div
            className="modal-content-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-3">
              <div className="modal-title-3">
                <BookOpen size={20} />
                Study Guide
              </div>
              <button
                className="modal-close-btn-3"
                onClick={() => setIsStudyModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-3">
              {studyGuide}
            </div>
          </div>
        </div>
      )}
    </>
  );
}