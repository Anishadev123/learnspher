import "./WelcomeBanner.css"

export default function WelcomeBanner({ userName }) {
  return (
    <div className="welcome-banner">
      <div className="banner-content">
        <div className="banner-icon">💻</div>
        <div className="banner-text">
          <h2>Hello, {userName}</h2>
          <p>Welcome back, its time to get back and start learning new course</p>
        </div>
      </div>
    </div>
  )
}
