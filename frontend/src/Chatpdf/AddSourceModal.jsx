"use client";

import { useState } from "react";
import "./AddSourceModal.css";
import { X, FileUp, Link2, Youtube, Type } from "lucide-react";

export default function AddSourceModal({ onClose, onAdd, notebookId }) {   // ⭐ TAKE notebookId
  const [sourceType, setSourceType] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    file: null,
    url: "",
    content: "",
  });

  const handleFileSelect = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleAdd = () => {
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    let finalPayload = {
      title: formData.title.trim(),
      type: sourceType,
      notebookId,                        // ⭐ IMPORTANT
    };

    if (sourceType === "pdf" && !formData.file) {
      alert("Please upload a PDF file");
      return;
    }

    if ((sourceType === "website" || sourceType === "youtube") && !formData.url.trim()) {
      alert("URL required");
      return;
    }

    if (sourceType === "text" && !formData.content.trim()) {
      alert("Text required");
      return;
    }

    if (sourceType === "pdf") finalPayload.file = formData.file;
    if (sourceType === "website") finalPayload.url = formData.url.trim();
    if (sourceType === "youtube") finalPayload.url = formData.url.trim();
    if (sourceType === "text") finalPayload.text = formData.content.trim();

    onAdd(finalPayload); // send to parent where actual API call happens

    setFormData({ title: "", file: null, url: "", content: "" });
    setSourceType(null);
  };

  return (
    <div className="modal-overlay-3" onClick={onClose}>
      <div className="modal-content-3" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-3">
          <h2>Add Source</h2>
          <button className="close-btn-3" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {!sourceType ? (
          <div className="source-type-grid-3">
            <button onClick={() => setSourceType("pdf")} className="source-type-btn-3">
              <FileUp size={32} />
              <span>Upload PDF</span>
            </button>

            <button onClick={() => setSourceType("website")} className="source-type-btn-3">
              <Link2 size={32} />
              <span>Website Link</span>
            </button>

            <button onClick={() => setSourceType("youtube")} className="source-type-btn-3">
              <Youtube size={32} />
              <span>YouTube Link</span>
            </button>

            <button onClick={() => setSourceType("text")} className="source-type-btn-3">
              <Type size={32} />
              <span>Paste Text</span>
            </button>
          </div>
        ) : (
          <div className="source-form-3">
            <button className="back-btn-3" onClick={() => setSourceType(null)}>← Back</button>

            <div className="form-group-3">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {sourceType === "pdf" && (
              <div className="form-group-3">
                <label>Upload PDF</label>
                <input type="file" accept=".pdf" onChange={handleFileSelect} />
              </div>
            )}

            {(sourceType === "website" || sourceType === "youtube") && (
              <div className="form-group-3">
                <label>{sourceType === "website" ? "Website URL" : "YouTube URL"}</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
            )}

            {sourceType === "text" && (
              <div className="form-group-3">
                <label>Paste Content</label>
                <textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                ></textarea>
              </div>
            )}

            <div className="form-actions-3">
              <button className="cancel-btn-3" onClick={() => setSourceType(null)}>Cancel</button>
              <button className="add-btn-3" onClick={handleAdd}>Add Source</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
