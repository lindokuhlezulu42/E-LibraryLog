// Login.jsx
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.scss";
import logo from "../assets/tut.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Mock users now have campus + role
  const users = [
    {
      email: "admin@tut.ac.za",
      password: "admin123",
      role: "admin",
      campus: "Admin", // just to have something
    },
    {
      email: "student@tut.ac.za",
      password: "student123",
      role: "student",
      campus: "eMalahleni",
    },
    {
      email: "student1@tut.ac.za",
      password: "student123",
      role: "student",
      campus: "Polokwane",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validate that email ends with @tut.ac.za
    if (!/^[\w.-]+@tut\.ac\.za$/.test(email)) {
      setError("Please use a valid TUT email address ");
      return;
    }

    // Find user
    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      setError("");

      // ✅ Save user to localStorage so Sidebar/App can read campus
      localStorage.setItem("user", JSON.stringify(matchedUser));
      localStorage.setItem("campus", matchedUser.campus); // quick access

      // Admin login
      if (matchedUser.role === "admin") {
        navigate("/admin");
      }

      // Student login
      if (matchedUser.role === "student") {
        // ✅ Send notification to admin
        const newNotification = {
          id: Date.now(),
          message: `Student ${email} logged in.`,
          timestamp: new Date().toLocaleString(),
          read: false,
        };

        const existingNotifications =
          JSON.parse(localStorage.getItem("adminNotifications")) || [];

        localStorage.setItem(
          "adminNotifications",
          JSON.stringify([newNotification, ...existingNotifications])
        );

        // ✅ Redirect student
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
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
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
