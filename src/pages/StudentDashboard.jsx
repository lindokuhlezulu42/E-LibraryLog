import React, { useEffect, useState, useContext } from "react";
import "../styles/StudentDashboard.scss";
import {
  Calendar,
  FileText,
  ArrowLeftRight,
  Clock,
  Sun,
  Bell,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReportContext } from "../context/ReportContext";

function StudentDashboard() {
  const navigate = useNavigate();
  const { reports } = useContext(ReportContext);
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage dynamically
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("studentNotifications")) || [];
    const shiftRequests = JSON.parse(localStorage.getItem("shiftExchangeRequests")) || [];

    const shiftNotifications = shiftRequests.map((req) => ({
      id: req.id,
      title: "Shift Exchange Request",
      message: `Your peer requested to swap ${req.myShift} with ${req.requestedShift}. Reason: ${req.reason}`,
      timestamp: new Date(req.id).toLocaleString(),
      read: false,
    }));

    const merged = [...shiftNotifications, ...stored].sort((a, b) => b.id - a.id);
    setNotifications(merged);
  }, []);

  // Mock upcoming shift, hours, leave (can remain same)
  const upcomingShift = {
    date: "Wednesday, Oct 26",
    time: "10:00 AM - 02:00 PM",
    location: "I-Center, Library Building",
    status: "Confirmed"
  };

  const hoursSummary = { thisWeek: "20.5 hours", thisMonth: "82.0 hours" };
  const remainingLeave = { days: "3 days", total: "5 days" };

  return (
    <div className="dashboard-container">
      <div className="main-content">

        {/* Welcome Section with Notification Bell */}
        <div className="welcome-section-with-bell">
          <h2>Welcome Back, Student!</h2>
          <button
            className="notification-bell-btn"
            onClick={() => navigate("/student-notifications")}
          >
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="notif-badge">{notifications.length}</span>
            )}
          </button>
        </div>
        <p>Here's a quick overview of your upcoming shifts and activities. Stay organized!</p>

        {/* Upcoming Shift */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon"><Clock size={20} /></div>
            <h3>Upcoming Shift</h3>
          </div>
          <div className="shift-details">
            <p className="shift-date">{upcomingShift.date}</p>
            <p className="shift-time">{upcomingShift.time}</p>
            <div className="shift-status">{upcomingShift.status}</div>
            <p className="shift-location">{upcomingShift.location}</p>
            <button className="view-schedule-btn" onClick={() => navigate("/schedule")}>
              View Schedule
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-row">
          <button className="action-button primary" onClick={() => navigate("/leave")}>
            <FileText size={20} /><span>Request Leave</span>
          </button>
          <button className="action-button secondary" onClick={() => navigate("/upload-proof-page")}>
            <Upload size={20} /><span>Leave Request Submission</span>
          </button>
        </div>

        {/* Hours Summary */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon"><Clock size={20} /></div>
            <h3>Hours Summary</h3>
          </div>
          <div className="hours-summary">
            <div className="hours-item">
              <p className="hours-label">This Week</p>
              <p className="hours-value">{hoursSummary.thisWeek}</p>
            </div>
            <div className="hours-item">
              <p className="hours-label">This Month</p>
              <p className="hours-value">{hoursSummary.thisMonth}</p>
            </div>
          </div>
        </div>

        {/* Remaining Leave */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon"><Sun size={20} /></div>
            <h3>Remaining Leave</h3>
          </div>
          <div className="leave-summary">
            <p className="leave-days">{remainingLeave.days}</p>
            <p className="leave-total">of {remainingLeave.total}</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="section-card">
          <h3>Notifications</h3>
          {notifications.length === 0 ? (
            <p>No notifications.</p>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-icon"><Bell size={20} /></div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">{notification.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            className="view-all-btn"
            onClick={() => navigate("/student-notifications")}
          >
            View All Notifications
          </button>
        </div>

        {/* Disruption Reports */}
        {reports.length > 0 && (
          <div className="section-card">
            <h3>Disruption Reports</h3>
            <div className="reports-list">
              {reports.map((report, index) => (
                <div key={index} className="report-item">
                  <p><strong>Date:</strong> {report.date}</p>
                  <p><strong>Location:</strong> {report.location}</p>
                  <p><strong>Type:</strong> {report.type}</p>
                  <p><strong>Description:</strong> {report.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;