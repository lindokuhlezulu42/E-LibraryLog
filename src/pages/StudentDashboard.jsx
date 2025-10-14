// src/pages/StudentDashboard.jsx
import React from "react";
import "../styles/StudentDashboard.scss";
import {
  History,
  Calendar,
  FileText,
  ArrowLeftRight,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();

  const statusCards = [
    { title: "Today's Sign In", value: "08:45 AM", color: "#3B82F6" },
    { title: "Today's Sign Out", value: "Not Signed Out", color: "#3B82F6" },
    { title: "Total Hours", value: "8h 15m", color: "#3B82F6" },
    { title: "Remaining Hours", value: "71h 45m", color: "#3B82F6" },
  ];

  const quickActions = [
    { name: "Report In/Out", icon: <History size={20} />, color: "#3B82F6", path: "/report" },
    { name: "My Schedule", icon: <Calendar size={20} />, color: "#3B82F6", path: "/schedule" },
    { name: "Leave Request", icon: <FileText size={20} />, color: "#3B82F6", path: "/leave" },
    { name: "Shift Exchange", icon: <ArrowLeftRight size={20} />, color: "#3B82F6", path: "/shift-exchange" },
    { name: "Upload Timetable", icon: <Upload size={20} />, color: "#3B82F6", path: "/upload-timetable" },
  ];

  return (
    <div className="dashboard">
      {/* Welcome Card */}
      <div className="welcome-card">
        <div className="welcome-content">
          <h1>Welcome back, Student</h1>
          <p>Manage your schedule, attendance, and requests all in one place.</p>
        </div>
        <div className="avatar">
          <span>J</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="status-grid">
        {statusCards.map((card, index) => (
          <div
            key={index}
            className="status-card"
            style={{ borderLeft: `4px solid ${card.color}` }}
          >
            <p className="card-title">{card.title}</p>
            <p className="card-value">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="action-btn"
              data-color={action.color}
              style={{ borderColor: action.color, color: action.color }}
            >
              <span className="action-icon">{action.icon}</span>
              <h3>{action.name}</h3>
              <p className="action-description">
                {action.name === "Report In/Out" && "Track your attendance with quick report in and out"}
                {action.name === "My Schedule" && "View your class schedule and updates"}
                {action.name === "Leave Request" && "Submit or manage your leave requests"}
                {action.name === "Shift Exchange" && "Exchange shifts with other students"}
                {action.name === "Upload Timetable" && "Upload your class timetable for schedule management"}
              </p>
              <button
                className="action-button"
                style={{
                  backgroundColor: "#3B82F6",
                  color: "white"
                }}
                onClick={() => navigate(action.path)} // ✅ Navigation added
              >
                {action.name === "Report In/Out" && "Report Now"}
                {action.name === "My Schedule" && "View Schedule"}
                {action.name === "Leave Request" && "Request Leave"}
                {action.name === "Shift Exchange" && "Exchange"}
                {action.name === "Upload Timetable" && "Upload now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
