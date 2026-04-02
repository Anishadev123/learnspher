"use client"

import { useState, useEffect } from "react"
import { Settings, Bell, Sparkles } from "lucide-react"
import Sidebar from "../components/Dashboard/Sidebar"
import WelcomeBanner from "../components/Dashboard/WelcomeBanner"
import StudyMaterialSection from "../components/Dashboard/StudyMaterialSection"
import StudyAnalytics from "../components/Dashboard/StudyAnalytics"
import CreateStudyPlanModal from "../components/Dashboard/CreateStudyPlanModal"
import { useCredits } from "../context/CreditsContext"
import "./Dashboard.css"

import { getAuth } from "firebase/auth";

export default function Dashboard() {
  const { usedCredits, availableCredits, totalCredits } = useCredits()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [idToken, setIdToken] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = () => {
    if (!idToken) return alert("Wait for authentication verification");
    navigate("/inputform", { state: { idToken } });
  };

  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <div className={`dashboard-container ${mounted ? "loaded" : ""}`}>
      <Sidebar
        userName={userName}
        credits={availableCredits}
        totalCredits={totalCredits}
        usedCredits={usedCredits}
        onCreateNew={() => setIsModalOpen(true)}
      />

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <div className="header-logo-group">
              <Sparkles size={22} className="header-sparkle" />
              <h1 className="dashboard-title">LearnSphere</h1>
            </div>
          </div>
          <div className="header-right">
            <button className="icon-btn" id="notifications-btn" title="Notifications">
              <Bell size={18} />
            </button>
            <button className="icon-btn" id="settings-btn" title="Settings">
              <Settings size={18} />
            </button>
            <div className="user-avatar">
              {userName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <WelcomeBanner userName={userName} />
          <StudyAnalytics />
          <StudyMaterialSection />
        </div>
      </div>

      <CreateStudyPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}