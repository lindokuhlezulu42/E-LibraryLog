import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff
import { useNavigate } from "react-router-dom";
import "../styles/Login.scss";
import logo from "../assets/tut.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling visibility
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const users = [
    { email: "admin@tut.ac.za", password: "admin123", role: "admin" },
    { email: "student@tut.ac.za", password: "student123", role: "student" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      setError("");
      if (matchedUser.role === "admin") {
        navigate("/admin");
      } else if (matchedUser.role === "student") {
        navigate("/dashboard");
      }
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="shadow-container">
        <div className="header">
          <img src={logo} alt="TUT" className="university-logo" />
          <h1 className="app-title">E-LibraryLog</h1>
          <p className="tagline">Smarter Scheduling, Better Balance.</p>
        </div>

        <div className="login-card">
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Sign in to your account to continue</p>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper password-wrapper">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* Eye icon for toggling password visibility */}
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="sign-in-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
