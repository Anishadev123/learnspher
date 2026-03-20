"use client"

import { Plus, LayoutGrid, Shield, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./Sidebar.css"

export default function Sidebar({ userName, credits, totalCredits, usedCredits, onCreateNew }) {
  const navigate = useNavigate()
  const progressPercentage = (usedCredits / totalCredits) * 100
  const handleLogout = () => navigate("/")
  const isDisabled = credits === 0
  const handleClick = () => {
    navigate("/chat-with-pdf");
  }
  return (
    <aside className="sidebar-1">
      <div className="sidebar-header-1">
        <div className="logo-1">
          <div className="logo-icon-1">✨</div>
          <span>LearnSphere</span>
        </div>
      </div>

      <button
        className="create-btn-1"
        onClick={onCreateNew}
        disabled={isDisabled}
        title={isDisabled ? "No credits available" : "Create a new study plan"}
      >
        <Plus size={20} />
        Create New
      </button>
      <button
        className="create-btn-1"
       onClick={handleClick}
      >
        <Plus size={20} />
        chat with pdf
      </button>

      <nav className="sidebar-nav-1">
        <div className="nav-item-1 active-1">
          <LayoutGrid size={20} />
          <span>Dashboard</span>
        </div>
        <div className="nav-item-1">
          <Shield size={20} />
          <span>Upgrade</span>
        </div>
      </nav>

      <div className="credits-section-1">
        <h3>Available Credits</h3>
        <div className="credits-display-1">{credits}</div>
        <div className="progress-bar-1">
          <div className="progress-fill-1" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p className="credits-text-1">
          {usedCredits} Out of {totalCredits} Credits used
        </p>
        {credits === 0 ? (
          <p className="credits-warning-1">No credits available. Upgrade to create more.</p>
        ) : (
          <a href="#" className="upgrade-link-1">
            Upgrade to create more
          </a>
        )}
      </div>

      <button className="logout-btn-1" onClick={handleLogout}>
        <LogOut size={18} />
        Logout
      </button>

      <div className="sidebar-footer-1">
        <div className="user-initial-1">{userName.charAt(0)}</div>
      </div>
    </aside>
  )
}
