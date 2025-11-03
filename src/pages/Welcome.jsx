
// src/pages/Welcome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import libraryBg from "../assets/library1.jpg"; // Import your background image
import "../styles/Welcome.scss";

function Welcome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div
      className="welcome-page"
      style={{ backgroundImage: `url(${libraryBg})` }}
    >
      <div className="welcome-content">
        <h1>E-LibraryLog</h1>
        <p>Smarter Scheduling, Better Balance.</p>
        <button className="get-started-btn" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Welcome;
