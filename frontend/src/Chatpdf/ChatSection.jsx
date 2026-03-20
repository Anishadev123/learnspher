import { useState } from "react"
import "./ChatSection.css"
import { Send, Paperclip, Plus } from "lucide-react"
import SourceViewer from "./SourceViewer"

export default function ChatSection({ messages, onSendMessage, onAddSource, selectedNotebook, activeSource, onCloseSource }) {
  const [input, setInput] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <div className="chat-section-3">
      <div className={`chat-layout-container ${activeSource ? 'split-view' : ''}`}>

        {/* CHAT AREA */}
        <div className="chat-area-wrapper">
          <div className="chat-header-3">
            <div className="chat-title-group-3">
              <h2 className="chat-title-3">{selectedNotebook ? selectedNotebook.name : "Start a Conversation"}</h2>
              {selectedNotebook && selectedNotebook.sources && (
                <span className="chat-source-count-3">{selectedNotebook.sources.length} sources</span>
              )}
            </div>
            <button className="add-source-btn-3" onClick={onAddSource} title="Add Source">
              <Plus size={20} />
            </button>
          </div>

          <div className="chat-messages-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-3 ${msg.sender}-3`}>
                <div className={`message-content-3 message-${msg.sender}-3`}>{msg.text}</div>
              </div>
            ))}
          </div>

          <form className="chat-input-area-3" onSubmit={handleSubmit}>
            <div className="input-wrapper-3">
              <input
                type="text"
                placeholder="Ask a question about your document..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="chat-input-3"
              />
              <button type="button" className="attachment-btn-3" title="Attach file">
                <Paperclip size={20} />
              </button>
              <button type="submit" className="send-btn-3" title="Send message">
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* SOURCE VIEWER AREA */}
        {activeSource && (
          <div className="source-viewer-wrapper">
            <SourceViewer source={activeSource} onClose={onCloseSource} />
          </div>
        )}

      </div>
    </div>
  )
}
