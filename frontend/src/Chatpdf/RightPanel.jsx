"use client";

import { useState, useEffect } from "react";
import "./RightPanel.css";
import {
  Lightbulb,
  BookOpen,
  BarChart3,
  FileText,
  Edit3,
  ChevronDown,
  ExternalLink,
  Play,
  Globe,
  BookMarked,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "./api";

export default function RightPanel({ activeSource, selectedNotebook, onNoteSaved }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studyGuide, setStudyGuide] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [resources, setResources] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Notes state
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  // Reset cached data when source changes
  useEffect(() => {
    setResources(null);
    setStudyGuide(null);
    setReportData(null);
    setSummaryData(null);
  }, [activeSource?._id]);

  // Load note when source changes
  useEffect(() => {
    if (!activeSource?._id) {
      setNoteText("");
      return;
    }
    const loadNote = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notes/source/${activeSource._id}`);
        const notes = await res.json();
        setNoteText(notes.length > 0 ? notes[0].text : "");
      } catch (err) {
        console.error("Failed to load note:", err);
      }
    };
    loadNote();
  }, [activeSource?._id]);

  // Save note
  const handleSaveNote = async () => {
    if (!activeSource || !selectedNotebook) return alert("Select a source first!");
    if (!noteText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: activeSource._id,
          notebookId: selectedNotebook._id || selectedNotebook.id,
          text: noteText,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
        if (onNoteSaved) onNoteSaved();
      }
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note");
    }
  };

  // 💡 SUGGEST RESOURCES
  const handleSuggestResources = async () => {
    if (!activeSource) return alert("Select a source first!");
    if (resources) { setIsResourceModalOpen(true); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tools/suggest/${activeSource._id}`, { method: "POST" });
      const data = await res.json();
      if (data.ok && data.resources) {
        setResources(data.resources);
        setIsResourceModalOpen(true);
      } else {
        alert(data.error || "Failed to get suggestions");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to suggest resources");
    } finally {
      setLoading(false);
    }
  };

  // 📘 STUDY GUIDE
  const handleStudy = async () => {
    if (!selectedNotebook) return alert("Select a notebook first!");
    if (studyGuide) { setIsStudyModalOpen(true); return; }

    setLoading(true);
    try {
      const notebookId = selectedNotebook._id || selectedNotebook.id;
      const res = await fetch(`${API_BASE_URL}/query/${notebookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Create a comprehensive study guide for this content", mode: "study_guide" }),
      });
      const data = await res.json();
      setStudyGuide(data.answer);
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
    if (!selectedNotebook) return alert("Select a notebook first!");
    setLoading(true);
    try {
      const notebookId = selectedNotebook._id || selectedNotebook.id;
      const res = await fetch(`${API_BASE_URL}/query/${notebookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Give a brief analytics report: word count estimate, key topics count, difficulty level, estimated reading time", mode: "answer" }),
      });
      const data = await res.json();
      setReportData(data.answer);
    } catch (err) {
      console.error(err);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // 📄 SUMMARY
  const handleSummary = async () => {
    if (!selectedNotebook) return alert("Select a notebook first!");
    if (summaryData) { setIsSummaryModalOpen(true); return; }

    setLoading(true);
    try {
      const notebookId = selectedNotebook._id || selectedNotebook.id;
      const res = await fetch(`${API_BASE_URL}/query/${notebookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Create a detailed summary of all the content", mode: "summary" }),
      });
      const data = await res.json();
      if (data.answer) {
        setSummaryData(data.answer);
        setIsSummaryModalOpen(true);
      } else {
        alert("No summary could be generated. Make sure the notebook has sources with ingested content.");
      }
    } catch (err) {
      console.error("Summary generation error:", err);
      alert("Failed to generate summary. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { id: "resources", icon: Lightbulb, label: "Suggest Resources", description: "AI-suggested study materials", action: handleSuggestResources, content: null },
    { id: "guide", icon: BookOpen, label: "Study Guide", description: "Key concepts & topics", action: handleStudy, content: null },
    {
      id: "reports", icon: BarChart3, label: "Reports", description: "Analytics & insights", action: handleReport,
      content: reportData ? <div className="report-content-3"><pre style={{ whiteSpace: "pre-wrap", color: "#e2e8f0", fontSize: "12px" }}>{reportData}</pre></div> : null,
    },
    { id: "summary", icon: FileText, label: "Summary", description: "Generate content summary", action: handleSummary,
      content: summaryData ? <div className="report-content-3"><pre style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary, #e2e8f0)", fontSize: "12px" }}>{summaryData}</pre></div> : null,
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
              <div key={feature.id} className={`feature-card-3 ${isExpanded ? "expanded-3" : ""}`}>
                <div className="feature-header-3" onClick={() => setExpandedSection(isExpanded ? null : feature.id)}>
                  <Icon size={24} className="feature-icon-3" />
                  <div className="feature-text-3">
                    <p className="feature-label-3">{feature.label}</p>
                    <p className="feature-description-3">{feature.description}</p>
                  </div>
                  <ChevronDown className={`chevron-3 ${isExpanded ? "rotated-3" : ""}`} size={20} />
                </div>
                {isExpanded && (
                  <div className="feature-content-3">
                    {!feature.content && !loading && (
                      <>
                        <p>{selectedNotebook ? "Ready to generate." : "Select a notebook first."}</p>
                        <button className="feature-btn-3" onClick={feature.action} disabled={!selectedNotebook}>Generate</button>
                      </>
                    )}
                    {loading && <div className="loading-indicator"><Loader2 size={16} className="spin" /> Generating...</div>}
                    {feature.content && (
                      <>
                        {feature.content}
                        <button className="regen-btn-3" onClick={feature.action}>Regenerate</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* NOTES SECTION */}
        <div className="notes-section-3">
          <div className="notes-header-3">
            <Edit3 size={20} />
            <h3>Notes</h3>
            {noteSaved && <span className="note-saved-badge">✅ Saved!</span>}
          </div>
          <textarea
            className="notes-textarea-3"
            placeholder={activeSource ? "Take notes while studying..." : "Select a source to take notes"}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={!activeSource}
          />
          <button
            className="save-notes-btn-3"
            onClick={handleSaveNote}
            disabled={!activeSource || !noteText.trim()}
          >
            Save Notes
          </button>
        </div>
      </div>

      {/* STUDY GUIDE MODAL */}
      {isStudyModalOpen && (
        <div className="modal-overlay-3" onClick={() => setIsStudyModalOpen(false)}>
          <div className="modal-content-3" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-3">
              <div className="modal-title-3"><BookOpen size={20} /> Study Guide</div>
              <button className="modal-close-btn-3" onClick={() => setIsStudyModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body-3">
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{studyGuide}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SUGGEST RESOURCES MODAL */}
      {isResourceModalOpen && resources && (
        <div className="modal-overlay-3" onClick={() => setIsResourceModalOpen(false)}>
          <div className="modal-content-3 resource-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-3">
              <div className="modal-title-3"><Lightbulb size={20} /> Suggested Resources</div>
              <button className="modal-close-btn-3" onClick={() => setIsResourceModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body-3">
              {resources.youtube?.length > 0 && (
                <div className="resource-section">
                  <h3 className="resource-section-title"><Play size={18} /> YouTube Videos</h3>
                  {resources.youtube.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="resource-card youtube-card">
                      <div className="resource-card-icon"><Play size={16} /></div>
                      <div className="resource-card-info">
                        <p className="resource-card-title">{r.title}</p>
                        <p className="resource-card-desc">{r.description}</p>
                      </div>
                      <ExternalLink size={14} className="resource-card-link" />
                    </a>
                  ))}
                </div>
              )}
              {resources.websites?.length > 0 && (
                <div className="resource-section">
                  <h3 className="resource-section-title"><Globe size={18} /> Websites</h3>
                  {resources.websites.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="resource-card website-card">
                      <div className="resource-card-icon"><Globe size={16} /></div>
                      <div className="resource-card-info">
                        <p className="resource-card-title">{r.title}</p>
                        <p className="resource-card-desc">{r.description}</p>
                      </div>
                      <ExternalLink size={14} className="resource-card-link" />
                    </a>
                  ))}
                </div>
              )}
              {resources.books?.length > 0 && (
                <div className="resource-section">
                  <h3 className="resource-section-title"><BookMarked size={18} /> Recommended Books</h3>
                  {resources.books.map((r, i) => (
                    <div key={i} className="resource-card book-card">
                      <div className="resource-card-icon"><BookMarked size={16} /></div>
                      <div className="resource-card-info">
                        <p className="resource-card-title">{r.title}</p>
                        {r.author && <p className="resource-card-author">by {r.author}</p>}
                        <p className="resource-card-desc">{r.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="regen-btn-3" style={{ marginTop: "1rem" }} onClick={() => { setResources(null); handleSuggestResources(); }}>
                🔄 Regenerate Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY MODAL */}
      {isSummaryModalOpen && summaryData && (
        <div className="modal-overlay-3" onClick={() => setIsSummaryModalOpen(false)}>
          <div className="modal-content-3" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-3">
              <div className="modal-title-3"><FileText size={20} /> Summary</div>
              <button className="modal-close-btn-3" onClick={() => setIsSummaryModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body-3">
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{summaryData}</pre>
              <button className="regen-btn-3" style={{ marginTop: "1rem" }} onClick={() => { setSummaryData(null); setIsSummaryModalOpen(false); handleSummary(); }}>
                🔄 Regenerate Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}