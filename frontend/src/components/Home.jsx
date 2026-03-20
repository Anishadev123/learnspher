
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/getstarted");
  };

  return (
    <div className="home-page-3">
      {/* Navbar */}
      <header className="navbar-3">
        <div className="logo-3">
          <img
            src="https://www.shutterstock.com/image-vector/world-globe-earth-planet-book-600nw-2196969807.jpg"
            alt="LearnSphere Logo"
            className="logo-icon-3"
          />
          <span>Learn-Sphere</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-3">
        <div className="hero-content-3">
          <span className="tagline-3">
            ✨ AI-Based Study Material & Personalized Tracking Platform
          </span>
          <h1>
            Learn Smarter, Track Better,
            <br /> Collaborate Together
          </h1>
          <p>
            Transform your study experience with AI chat, study materials,
            personalized tracking, and seamless collaboration. Your journey to
            academic excellence starts here.
          </p>
          <button className="btn-primary-3" onClick={handleClick}>
            Get Started
          </button>
        </div>

        <div className="hero-image-3">
          <img
            src="https://www.talentlms.com/blog/wp-content/uploads/2016/10/online-collaborative-learning.png"
            alt="Learning"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-3">
        <h2>Empowering Every Learner</h2>
        <p className="subtitle-3">
          LearnSphere provides comprehensive tools to boost your academic growth.
        </p>

        <div className="feature-grid-3">
          <div className="feature-card-3">
            <div className="feature-number-3">1</div>
            <h3>Learn Programming Skills</h3>
            <p>
              Upload documents and get instant AI summaries to understand
              complex topics faster and retain more knowledge.
            </p>
          </div>

          <div className="feature-card-3">
            <div className="feature-number-3">2</div>
            <h3>Personalized learning</h3>
            <p>
              Track your learning progress visually and gain detailed insights
              into your academic performance.
            </p>
          </div>

          <div className="feature-card-3">
            <div className="feature-number-3">3</div>
            <h3>Collaborate with Fellows</h3>
            <p>
              Connect with peers, share resources, and collaborate seamlessly
              within the LearnSphere platform.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-3">
        <div className="footer-container-3">
          <div className="footer-section-3">
            <div className="footer-logo-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/747/747376.png"
                alt="LearnSphere Icon"
                width="30"
              />
              <span>Learn-Sphere</span>
            </div>
            <p>
              AI-powered learning platform for smarter studying and better
              tracking.
            </p>
          </div>

          <div className="footer-section-3">
            <h3>Product</h3>
            <ul>
              <li>Features</li>
              <li>Pricing</li>
              <li>Resources</li>
            </ul>
          </div>

          <div className="footer-section-3">
            <h3>Company</h3>
            <ul>
              <li>About</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>

          <div className="footer-section-3">
            <h3>Legal</h3>
            <ul>
              <li>Privacy</li>
              <li>Terms</li>
              <li>Security</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-3">
          © 2025 Learn-Sphere. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
