"use client";

import { useState, useEffect } from "react";
import "./chat.css";
import Sidebar from "./Sidebar";
import ChatSection from "./ChatSection";
import RightPanel from "./RightPanel";
import CreateNotebookModal from "./CreateNotebookModal";
import AddSourceModal from "./AddSourceModal";
import { API_BASE_URL } from "./api";

export default function ChatpdfDashboard() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);

  const [isCreateNotebookOpen, setIsCreateNotebookOpen] = useState(false);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! Upload a PDF or add a link to get started.",
    },
  ]);

  // -------------------------------
  // FETCH NOTEBOOKS (ON MOUNT)
  // -------------------------------
  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notebook`);
      const data = await res.json();
      // data should be array of notebooks with populated 'sources'
      setNotebooks(data);

      // Update selectedNotebook if it exists to ensure sources are fresh
      if (selectedNotebook) {
        const currentId = selectedNotebook._id || selectedNotebook.id;
        const updated = data.find(n => (n._id || n.id) === currentId);
        if (updated) {
          setSelectedNotebook(updated);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notebooks:", err);
    }
  };

  const [activeSource, setActiveSource] = useState(null);

  // -------------------------------
  // CREATE NOTEBOOK
  // -------------------------------
  const handleCreateNotebook = async (notebookName) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: notebookName }),
      });

      const nb = await res.json();

      // Optimistically select and set
      const newNb = { ...nb, sources: [] };
      setSelectedNotebook(newNb);

      // Re-fetch to get consistent structure
      fetchNotebooks();

      setIsCreateNotebookOpen(false);
      setIsAddSourceOpen(true); // open "Add Source"

    } catch (err) {
      console.error("Notebook creation failed:", err);
    }
  };


  // -------------------------------
  // UPLOAD SOURCE
  // -------------------------------
  const handleAddSource = async (source) => {
    try {
      const fd = new FormData();
      fd.append("notebookId", selectedNotebook._id || selectedNotebook.id);
      fd.append("sourceType", source.type);

      if (source.type === "pdf") {
        fd.append("file", source.file);
      }

      if (source.type === "website") {
        fd.append("url", source.url);
      }

      if (source.type === "youtube") {
        fd.append("url", source.url);
      }

      if (source.type === "text") {
        fd.append("text", source.text);
      }

      const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await uploadRes.json();

      // Refresh notebooks to get the new source listing
      await fetchNotebooks();

      setIsAddSourceOpen(false);

      setNotebooks(updated);
      setIsAddSourceOpen(false);

    } catch (err) {
      console.error("Source upload failed:", err);
    }
  };

  // -------------------------------
  // DELETE NOTEBOOK
  // -------------------------------
  const handleDeleteNotebook = async (notebookId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notebook/${notebookId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setNotebooks(prev => prev.filter(nb => (nb._id || nb.id) !== notebookId));
        if ((selectedNotebook?._id || selectedNotebook?.id) === notebookId) {
          setSelectedNotebook(null);
          setActiveSource(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete notebook:", err);
    }
  };

  // -------------------------------
  // DELETE SOURCE
  // -------------------------------
  const handleDeleteSource = async (sourceId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/source/${sourceId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        // Refresh logic - optimistic or re-fetch
        await fetchNotebooks();
        if (activeSource?._id === sourceId) {
          setActiveSource(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete source:", err);
    }
  };


  // -------------------------------
  // CHAT MESSAGE
  // -------------------------------
  const handleSendMessage = async (text) => {
    const userMessage = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch(
        `${API_BASE_URL}/query/${selectedNotebook._id || selectedNotebook.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text, mode: "answer" }),
        }
      );

      const data = await res.json();

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.answer || "No answer found.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "❌ Backend not responding.",
        },
      ]);
    }
  };

  return (
    <div className="chat-pdf-container-3">
      <Sidebar
        sources={selectedNotebook?.sources || []}
        selectedSource={activeSource}
        onSelectSource={(source) => {
          console.log("Selected Source:", source);
          setActiveSource(source);
        }}
        selectedNotebook={selectedNotebook}
        notebooks={notebooks}
        onSelectNotebook={setSelectedNotebook}
        onNewNotebook={() => setIsCreateNotebookOpen(true)}
        onDeleteNotebook={handleDeleteNotebook}
        onDeleteSource={handleDeleteSource}
      />

      <ChatSection
        messages={messages}
        onSendMessage={handleSendMessage}
        onAddSource={() => setIsAddSourceOpen(true)}
        selectedNotebook={selectedNotebook}
        activeSource={activeSource}
        onCloseSource={() => setActiveSource(null)}
      />


      <RightPanel activeSource={activeSource} />

      <RightPanel />


      {isCreateNotebookOpen && (
        <CreateNotebookModal
          onClose={() => setIsCreateNotebookOpen(false)}
          onCreate={handleCreateNotebook}
        />
      )}

      {isAddSourceOpen && selectedNotebook && (
        <AddSourceModal
          notebookId={selectedNotebook.id}
          onClose={() => setIsAddSourceOpen(false)}
          onAdd={handleAddSource}
        />
      )}
    </div>
  );
}
