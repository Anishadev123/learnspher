"use client";

import { useState } from "react";
import "./CreateNotebookModal.css";
import { X } from "lucide-react";

export default function CreateNotebookModal({ onClose, onCreate }) {
  const [notebookName, setNotebookName] = useState("");

  const handleCreate = () => {
    if (!notebookName.trim()) {
      alert("Please enter a notebook name");
      return;
    }

    onCreate(notebookName.trim());
    setNotebookName("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleCreate();
  };

  return (
    <div className="modal-overlay-3" onClick={onClose}>
      <div className="modal-content-3" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-3">
          <h2 className="modal-title-3">Create New Notebook</h2>
          <button className="close-btn-3" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="notebook-form-3">
          <div className="form-group-3">
            <label className="form-label-3">Notebook Name</label>
            <input
              type="text"
              placeholder="e.g., Machine Learning Notes..."
              value={notebookName}
              onChange={(e) => setNotebookName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="notebook-input-3"
              autoFocus
            />
          </div>

          <div className="form-actions-3">
            <button className="cancel-btn-3" onClick={onClose}>
              Cancel
            </button>
            <button className="create-btn-3" onClick={handleCreate}>
              Create Notebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
