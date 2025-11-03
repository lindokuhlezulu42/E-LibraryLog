// src/pages/ReportInOut.jsx
import React, { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import "../styles/ReportInOut.scss";

function ReportInOut() {
  const [isWorking, setIsWorking] = useState(false);
  const [lastReportIn, setLastReportIn] = useState(null);
  const [lastReportOut, setLastReportOut] = useState(null);
  const [status, setStatus] = useState("");

  // Function to notify admin
  const notifyAdmin = (message) => {
    const adminNotifications =
      JSON.parse(localStorage.getItem("adminNotifications")) || [];
    const newAdminNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    localStorage.setItem(
      "adminNotifications",
      JSON.stringify([newAdminNotification, ...adminNotifications])
    );
  };

  const handleReportIn = () => {
    const now = new Date().toLocaleTimeString();
    setLastReportIn(now);
    setIsWorking(true);
    setStatus("✅ You are now clocked in!");

    // Notify admin
    notifyAdmin(`Student reported IN at ${now}`);
  };

  const handleReportOut = () => {
    if (!isWorking) {
      return setStatus(
        "❌ You are not currently working. Please report in first."
      );
    }

    const now = new Date().toLocaleTimeString();
    setLastReportOut(now);
    setIsWorking(false);
    setStatus("✅ You are now clocked out!");

    // Notify admin
    notifyAdmin(`Student reported OUT at ${now}`);
  };

  return (
    <div className="report-in-out-page">
      <h1>Report In/Out</h1>
      <p>Track your attendance and working hours</p>

      {/* Current Status Card */}
      <div className="status-card">
        <div className="card-header">
          <h2>Current Status</h2>
          <span
            className={`status-badge ${
              isWorking ? "working" : "not-reported"
            }`}
          >
            {isWorking ? "Working" : "Not Reported"}
          </span>
        </div>

        <div className="status-content">
          <Clock size={48} className="clock-icon" />
          <h3>{isWorking ? "Currently Working" : "Not Currently Working"}</h3>
          <p>
            {isWorking
              ? "You are actively tracking your hours."
              : "Report in to start tracking your hours"}
          </p>
        </div>

        <div className="action-buttons">
          <button
            className="report-in-btn"
            onClick={handleReportIn}
            disabled={isWorking}
          >
            <CheckCircle size={20} color="white" /> Report In
          </button>
          <button
            className="report-out-btn"
            onClick={handleReportOut}
            disabled={!isWorking}
          >
            <XCircle size={20} color="white" /> Report Out
          </button>
        </div>
      </div>

      {/* Today's Activity Card */}
      <div className="activity-card">
        <h2>Today's Activity</h2>

        {lastReportIn || lastReportOut ? (
          <div className="activity-log">
            {lastReportIn && (
              <div className="log-item">
                <CheckCircle size={18} color="#ffffff" />
                <span>Reported In at {lastReportIn}</span>
              </div>
            )}
            {lastReportOut && (
              <div className="log-item">
                <XCircle size={18} color="#ffffff" />
                <span>Reported Out at {lastReportOut}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="no-activity">
            <Clock size={48} color="#ffffff" />
            <p>No activity recorded yet today</p>
          </div>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <p className={`status ${status.startsWith("✅") ? "success" : "error"}`}>
          {status}
        </p>
      )}
    </div>
  );
}

export default ReportInOut;
