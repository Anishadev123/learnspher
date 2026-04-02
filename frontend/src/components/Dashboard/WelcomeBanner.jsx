import { Rocket } from "lucide-react"
import "./WelcomeBanner.css"

export default function WelcomeBanner({ userName }) {
  return (
    <div className="welcome-banner">
      <div className="banner-glow"></div>
      <div className="banner-content">
        <div className="banner-icon-wrap">
          <Rocket size={28} className="banner-icon" />
        </div>
        <div className="banner-text">
          <h2>Welcome back, {userName}!</h2>
          <p>Ready to continue your learning journey? Pick up where you left off or create something new.</p>
        </div>
      </div>
    </div>
  )
}
