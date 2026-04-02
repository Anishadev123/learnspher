"use client"

import { Plus, LayoutGrid, Shield, LogOut, BrainCircuit, Zap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./Sidebar.css"

export default function Sidebar({ userName, credits, totalCredits, usedCredits, onCreateNew }) {
  const navigate = useNavigate()
  const progressPercentage = (usedCredits / totalCredits) * 100
  const handleLogout = () => navigate("/")
  const isDisabled = credits === 0

  return (
    <aside className="sidebar-1">
      <div className="sidebar-header-1">
        <div className="logo-1">
          <div className="logo-icon-1">
            <Zap size={20} />
          </div>
          <span>LearnSphere</span>
        </div>
      </div>

      {/* Navigation — Dashboard first */}
      <nav className="sidebar-nav-1">
        <div className="nav-item-1 active-1" onClick={() => navigate("/dashboard")}>
          <LayoutGrid size={18} />
          <span>Dashboard</span>
        </div>
        <div className="nav-item-1" onClick={() => navigate("/chat-with-pdf")}>
          <BrainCircuit size={18} />
          <span>AI Studio</span>
        </div>
        <div className="nav-item-1">
          <Shield size={18} />
          <span>Upgrade</span>
        </div>
      </nav>

      {/* Create New Button */}
      <button
        className="create-btn-1"
        onClick={onCreateNew}
        disabled={isDisabled}
        title={isDisabled ? "No credits available" : "Create a new study plan"}
      >
        <Plus size={18} />
        Create New
      </button>

      {/* Credits Section */}
      <div className="credits-section-1">
        <div className="credits-header-1">
          <h3>Credits</h3>
          <span className="credits-badge-1">{credits} left</span>
        </div>
        <div className="progress-bar-1">
          <div className="progress-fill-1" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p className="credits-text-1">
          {usedCredits} of {totalCredits} used
        </p>
        {credits === 0 ? (
          <p className="credits-warning-1">No credits left. Upgrade to continue.</p>
        ) : (
          <a href="#" className="upgrade-link-1">
            Upgrade for more →
          </a>
        )}
      </div>

      <button className="logout-btn-1" onClick={handleLogout}>
        <LogOut size={16} />
        Logout
      </button>

      <div className="sidebar-footer-1">
        <div className="user-initial-1">{userName.charAt(0).toUpperCase()}</div>
        <span className="user-name-1">{userName}</span>
      </div>
    </aside>
  )
}
