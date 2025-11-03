// src/pages/AdminDashboard.jsx
import React, { useContext, useState, useEffect } from "react";
import "../styles/AdminDashboard.scss";
import { ReportContext } from "../context/ReportContext";
import { Users, FileText, Bell, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const { reports } = useContext(ReportContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // 🧪 Mock stats (you can expand these later)
  const stats = [
    {
      title: "Total Student Assistants",
      value: 24,
      icon: <Users size={20} color="#3b82f6" />,
    },
    {
      title: "Active Shift Exchanges",
      value: 5,
      icon: <Bell size={20} color="#10b981" />,
    },
    {
      title: "Pending Leave Requests",
      value: 3,
      icon: <FileText size={20} color="#f59e0b" />,
    },
    {
      title: "Reported Disruptions",
      value: reports.length,
      icon: <AlertTriangle size={20} color="#ef4444" />,
    },
  ];

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const stored = JSON.parse(localStorage.getItem("adminNotifications")) || [];
      const unread = stored.filter((n) => !n.read).length;
      setUnreadCount(unread);
    };
    loadNotifications();

    // Sync with other tabs
    const onStorage = (e) => {
      if (e.key === "adminNotifications") loadNotifications();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 🧠 Mock recent activity (mixing real reports + static items)
  const recentActivity = reports
    .map((r) => ({
      title: r.type,
      description: r.description,
      time: r.date,
    }))
    .concat([
      {
        title: "New Assistant Added",
        description: "Admin registered a new student assistant.",
        time: "2025-10-12",
      },
      {
        title: "Timetable Updated",
        description: "Weekly schedule uploaded successfully.",
        time: "2025-10-10",
      },
    ]);

  return (
    <div className="admin-container">
      <div className="notification-icon" onClick={() => navigate("/admin/notifications")}>
        <Bell size={24} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
      </div>
      <div className="dashboard-content">
        <p className="welcome-text">Welcome back! Here's the latest overview.</p>

        {/* 📊 Stats Section */}
        <div className="stats-cards">
          {stats.map((s, index) => (
            <div className="stat-card" key={index}>
              <div className="card-header">
                {s.title}
                {s.icon}
              </div>
              <div className="card-value">{s.value}</div>
              <div className="card-subtext">Updated just now</div>
            </div>
          ))}
        </div>

        {/* ⚡ Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <p>Manage operations quickly using the shortcuts below.</p>
          <div className="action-buttons">
            <button onClick={() => navigate("/admin/students")}>
              Add Student Assistant
            </button>
            <button onClick={() => navigate("/admin/view-leaves")}>
              View Leave Requests
            </button>
            <button onClick={() => navigate("/admin/view-shift-exchanges")}>
              View Shift Exchanges
            </button>
            <button onClick={() => navigate("/admin/disruption")}>
              View Disruption Reports
            </button>
            <button onClick={() => navigate("/admin/generate-report")}>
              Generate Report
            </button>
          </div>
        </div>

        {/* 🕒 Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <p className="subtext">Latest reports and updates</p>

          <ul className="activity-list">
            {recentActivity.map((activity, index) => (
              <li className="activity-item" key={index}>
                <div className="activity-info">
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                </div>
                <div className="time">{activity.time}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
