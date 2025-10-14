// src/pages/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Add this
import "../styles/AdminDashboard.scss";
import { FileText, CheckCircle, Clock } from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate(); // ✅ Initialize navigate

  // Mock recent activity data
  const activities = [
    { name: "John Doe", action: "requested leave", time: "2 hours ago" },
    { name: "Jane Smith", action: "submitted shift exchange", time: "5 hours ago" },
    { name: "Mike Johnson", action: "uploaded schedule", time: "1 day ago" },
  ];

  // Handle View All Schedules click
  const handleViewSchedules = () => {
    navigate("/admin/view-schedules");
  };

  // Handle Generate Monthly Report click
  const handleGenerateReport = () => {
    navigate("/Monthly-report");
  };

  return (
    <div className="admin-container sidebar-expanded">
      <main className="dashboard-content">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="welcome-text">Welcome back, Admin</p>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="card-header">
              <span>Pending Leaves</span>
              <FileText size={20} color="#3B82F6" />
            </div>
            <div className="card-value">8</div>
            <div className="card-trend">+2 from last week</div>
          </div>

          <div className="stat-card">
            <div className="card-header">
              <span>Today's Coverage</span>
              <CheckCircle size={20} color="#10B981" />
            </div>
            <div className="card-value">92%</div>
            <div className="card-subtext">11 out of 12 shifts covered</div>
          </div>

          <div className="stat-card">
            <div className="card-header">
              <span>This Week's Hours</span>
              <Clock size={20} color="#F59E0B" />
            </div>
            <div className="card-value">247</div>
            <div className="card-subtext">Total hours scheduled</div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <p>Manage your student assistants efficiently</p>
          <div className="action-buttons">
            <button className="primary-btn" onClick={handleGenerateReport}>
              Generate Monthly Report
            </button>
            <button className="secondary-btn" onClick={handleViewSchedules}>
              View All Schedules
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <p className="subtext">Latest updates from your team</p>
          <ul className="activity-list">
            {activities.map((activity, index) => (
              <li key={index} className="activity-item">
                <div className="activity-info">
                  <h4>{activity.name}</h4>
                  <p>{activity.action}</p>
                </div>
                <span className="time">{activity.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
