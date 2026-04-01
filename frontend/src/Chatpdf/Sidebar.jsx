"use client";

import { useState, useEffect } from "react";
import "./Sidebar.css";
import { FileText, Trash2, Plus, ChevronDown, ChevronRight, Play, Globe, StickyNote } from "lucide-react";
import { API_BASE_URL } from "./api";

export default function Sidebar({ notebooks, onSelectNotebook, selectedNotebook, onNewNotebook, onSelectSource, selectedSource, onDeleteNotebook, onDeleteSource, notesVersion }) {
  const [expandedNotebooks, setExpandedNotebooks] = useState({});
  const [notebookNotes, setNotebookNotes] = useState({});
  const [viewingNote, setViewingNote] = useState(null);

  const toggleNotebook = (e, notebookId) => {
    e.stopPropagation();
    setExpandedNotebooks(prev => ({
      ...prev,
      [notebookId]: !prev[notebookId]
    }));
  };

  // Load notes when a notebook is expanded
  useEffect(() => {
    const nbId = selectedNotebook?._id || selectedNotebook?.id;
    if (!nbId) return;

    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notes/notebook/${nbId}`);
        const notes = await res.json();
        setNotebookNotes(prev => ({ ...prev, [nbId]: notes }));
      } catch (err) {
        console.error("Failed to load notes:", err);
      }
    };
    fetchNotes();
  }, [selectedNotebook?._id, selectedNotebook?.id, notesVersion]);

  return (
    <>
      <div className="sidebar-3">
        <div className="sidebar-header-3">
          <h1 className="sidebar-title-3">Notebooks</h1>
        </div>

        <div className="sources-list-3">
          {notebooks?.map((nb) => {
            const nbId = nb._id || nb.id;
            const selectedId = selectedNotebook?._id || selectedNotebook?.id;
            const notes = notebookNotes[nbId] || [];

            return (
              <div key={nbId} className="notebook-container">
                <div
                  className={`source-item-3 ${selectedId === nbId ? "active-3" : ""}`}
                  onClick={() => onSelectNotebook(nb)}
                >
                  <div className="source-icon-3">
                    <FileText size={18} />
                  </div>

                  <div className="source-info-3">
                    <p className="source-title-3">{nb.name}</p>
                    <span className="source-type-3">{nb.sources?.length || 0} sources</span>
                  </div>

                  <button className="expand-btn" onClick={(e) => toggleNotebook(e, nbId)}>
                    {expandedNotebooks[nbId] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  <button
                    className="delete-btn-3"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this notebook?")) onDeleteNotebook(nbId);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {expandedNotebooks[nbId] && (
                  <div className="notebook-sources-list">
                    {nb.sources?.map(source => {
                      const sourceNotes = notes.filter(n => n.sourceId === source._id);
                      return (
                        <div key={source._id}>
                          <div
                            className={`notebook-source-item ${selectedSource?._id === source._id ? 'active-source' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onSelectSource(source); }}
                          >
                            <span className="source-icon-small">
                              {source.type === 'pdf' ? <FileText size={14} /> :
                                source.type === 'youtube' ? <Play size={14} /> :
                                  <Globe size={14} />}
                            </span>
                            <span className="source-name-small" title={source.originalName}>{source.originalName}</span>

                            {sourceNotes.length > 0 && (
                              <span
                                className="note-indicator"
                                title="Has notes"
                                onClick={(e) => { e.stopPropagation(); setViewingNote(sourceNotes[0]); }}
                              >
                                <StickyNote size={12} />
                              </span>
                            )}

                            <button
                              className="delete-btn-3"
                              style={{ marginLeft: 'auto', opacity: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Delete this source?")) onDeleteSource(source._id);
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(!nb.sources || nb.sources.length === 0) && (
                      <div className="no-sources-msg">No sources</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer-3">
          <button className="new-chat-btn-3" onClick={onNewNotebook}>
            <Plus size={18} />
            New Notebook
          </button>
        </div>
      </div>

      {/* NOTE MODAL */}
      {viewingNote && (
        <div className="note-modal-overlay" onClick={() => setViewingNote(null)}>
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-header">
              <div className="note-modal-title">
                <StickyNote size={18} /> Note
              </div>
              <button className="note-modal-close" onClick={() => setViewingNote(null)}>✕</button>
            </div>
            <div className="note-modal-body">
              <pre className="note-modal-text">{viewingNote.text}</pre>
              <p className="note-modal-date">
                Last updated: {new Date(viewingNote.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
