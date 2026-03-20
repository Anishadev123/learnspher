"use client"

import { useState } from "react"
import { Settings, Bell } from "lucide-react"
import Sidebar from "../components/Dashboard/Sidebar"
import WelcomeBanner from "../components/Dashboard/WelcomeBanner"
import StudyMaterialSection from "../components/Dashboard/StudyMaterialSection"
import CreateStudyPlanModal from "../components/Dashboard/CreateStudyPlanModal"
import { useCredits } from "../context/CreditsContext"
import "./Dashboard.css"

import { getAuth } from "firebase/auth";


export default function Dashboard() {
  
  const { usedCredits, availableCredits, totalCredits } = useCredits()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [idToken, setIdToken] = useState(null);
    const handleSubmit = () => {
      if (!idToken) return alert("Wait for authentication verification");
      navigate("/inputform", { state: { idToken } });
    };
  
    const auth = getAuth();
    const user = auth.currentUser;
    const userName = user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <div className="dashboard-container">
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
            <h1 className="dashboard-title">LearnSphere</h1>
          </div>
          <div className="header-right">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <button className="icon-btn">
              <Settings size={20} />
            </button>
            <div className="user-avatar">S</div>
          </div>
        </div>

        <div className="dashboard-content">
          <WelcomeBanner userName={userName} />
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
