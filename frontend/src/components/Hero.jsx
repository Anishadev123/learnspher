"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./Hero.css"

export default function Hero() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate("/dashboard")
  }

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="container hero-content">
        <div className="hero-badge animate-fade-in-up">
          <Sparkles size={16} />
          <span>New: AI-Integrated Learning Platform</span>
        </div>

        <h1 className="hero-title animate-fade-in-up">
          <span>Transform Your</span>
          <span className="gradient-text">Study Experience</span>
          <span>with AI</span>
        </h1>

        <p className="hero-subtitle animate-fade-in-up">
          Generate personalized exam prep materials in seconds. StudyGenie uses advanced AI to create custom study
          guides, practice questions, and learning paths tailored to your needs.
        </p>

        <div className="hero-buttons animate-fade-in-up">
          <button className="btn btn-primary" onClick={handleGetStarted}>
            Get Started
            <ArrowRight size={20} />
          </button>
          <button className="btn btn-secondary">Watch Demo</button>
        </div>

        <div className="hero-stats animate-fade-in-up">
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Active Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1M+</div>
            <div className="stat-label">Materials Generated</div>
          </div>
        </div>
      </div>

      <div className="hero-illustration animate-float">
        <div className="floating-card card-1">
          <div className="card-icon">📚</div>
          <div className="card-text">Study Guide</div>
        </div>
        <div className="floating-card card-2">
          <div className="card-icon">✅</div>
          <div className="card-text">Practice Test</div>
        </div>
        <div className="floating-card card-3">
          <div className="card-icon">🎯</div>
          <div className="card-text">Learning Path</div>
        </div>
      </div>
    </section>
  )
}
