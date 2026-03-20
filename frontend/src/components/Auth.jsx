import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doPasswordReset,
} from "../firebase/auth"; // adjust path
import { useAuth } from "../contexts/index"; // your AuthContext
import "./Auth.css";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  // ✅ Redirect only if the user is actually logged in (after Firebase confirms)
  useEffect(() => {
    if (userLoggedIn) {
      navigate("/dashboard");
    }
  }, [userLoggedIn, navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Send Firebase ID token to backend for verification
  const sendTokenToBackend = async (token) => {
    try {
      const res = await axios.post("http://localhost:5000/api/verify", { token });
      console.log("✅ Token verified by backend:", res.data);
    } catch (err) {
      console.error("❌ Error sending token:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // validation
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (activeTab === "signup" && !formData.name) newErrors.name = "Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      let userCredential;

      if (activeTab === "signup") {
        userCredential = await doCreateUserWithEmailAndPassword(
          formData.email,
          formData.password
        );
        alert("Signup successful!");
      } else {
        userCredential = await doSignInWithEmailAndPassword(
          formData.email,
          formData.password
        );
      }

      const token = await userCredential.user.getIdToken();
      await sendTokenToBackend(token);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      let msg = "Something went wrong";
      if (error.code === "auth/email-already-in-use") msg = "Email already in use";
      else if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password")
        msg = "Invalid email or password";
      else if (error.code === "auth/user-not-found") msg = "No account found with this email";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await doSignInWithGoogle();
      const token = await result.user.getIdToken();
      await sendTokenToBackend(token);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Google sign-in failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert("Please enter your email to reset password");
      return;
    }
    try {
      await doPasswordReset(formData.email);
      alert("Password reset email sent!");
    } catch (error) {
      console.error(error);
      alert("Error sending reset email");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-illustration">
        <img src="/illustrations.svg" alt="Illustration" />
      </div>

      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome 👋</h1>
            <p className="auth-subtitle">
              Please, enter your details and start your work!
            </p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Log in
            </button>
            <button
              className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {activeTab === "signup" && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="johndoe@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Processing..." : activeTab === "login" ? "Log in" : "Sign up"}
            </button>

            {activeTab === "login" && (
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot your password?
              </button>
            )}
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="social-buttons">
            <button className="social-button google" onClick={handleGoogleSignIn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Login with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
