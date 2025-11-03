//NotificationPage.jsx
import React, { useState, useEffect } from "react";
import { Send, ArrowLeft, Bell, Trash2, User } from "lucide-react";
import "../styles/NotificationPage.scss";

function NotificationPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState([]);

  const testStudentEmail = "student@tut.ac.za"; // 👈 Always use this instead of "You"

  // Mock student data
  const students = [
    { id: 1, name: "John Smith", email: "student@tut.ac.za" },
    { id: 2, name: "Jane Doe", email: "jane.doe@tut.ac.za" },
    { id: 3, name: "Michael Johnson", email: "michael.johnson@tut.ac.za" },
    { id: 4, name: "Emily Wilson", email: "emily.wilson@tut.ac.za" },
    { id: 5, name: "David Brown", email: "david.brown@tut.ac.za" },
  ];

  // Load admin notifications from localStorage
  useEffect(() => {
    const load = () => {
      const stored = JSON.parse(localStorage.getItem("adminNotifications")) || [];
      setLoginNotifications(stored);
    };
    load();

    // keep page in sync when other tabs/pages write to localStorage
    const onStorage = (e) => {
      if (e.key === "adminNotifications") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Handle selecting students
  const handleStudentSelect = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((student) => student.id));
    }
  };

  // Send notification to selected students (manual admin message)
  const handleSendNotification = (e) => {
    e.preventDefault();

    if (!subject || !message) {
      return setStatus("Please fill in all required fields.");
    }
    if (selectedStudents.length === 0) {
      return setStatus("Please select at least one student to notify.");
    }

    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setStatus(
        `✅ Notification sent successfully to ${selectedStudents.length} student${
          selectedStudents.length > 1 ? "s" : ""
        }!`
      );

      // Save notifications for selected students
      const newNotifications = selectedStudents.map((id) => {
        const student = students.find((s) => s.id === id);
        return {
          id: Date.now() + id,
          subject,
          message,
          studentEmail: student.email,
          timestamp: new Date().toLocaleString(),
          read: false,
          type: "manual-admin", // distinguish from shift-exchange
        };
      });

      const existingStudentNotifs =
        JSON.parse(localStorage.getItem("studentNotifications")) || [];

      localStorage.setItem(
        "studentNotifications",
        JSON.stringify([...newNotifications, ...existingStudentNotifs])
      );

      // Reset form
      setSubject("");
      setMessage("");
      setSelectedStudents([]);
    }, 1200);
  };

  const handleBack = () => {
    window.history.back();
  };

  // Mark admin notification as read
  const markAsRead = (id) => {
    const updated = loginNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setLoginNotifications(updated);
    localStorage.setItem("adminNotifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    localStorage.removeItem("adminNotifications");
    setLoginNotifications([]);
  };

  const shiftExchangeNotifs = loginNotifications.filter((n) => n.type === "shift-exchange");
  const otherNotifs = loginNotifications.filter((n) => n.type !== "shift-exchange");

  return (
    <div className="notification-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
        </button>
        <h1>Admin Notifications</h1>
      </div>

      {/* Shift Exchange Alerts */}
      <div className="login-notifications">
        <div className="section-header">
          <h2>
            <Bell size={20} /> Shift Exchange Alerts
          </h2>
          {shiftExchangeNotifs.length > 0 && (
            <button className="clear-btn" onClick={clearAll}>
              <Trash2 size={18} /> Clear All
            </button>
          )}
        </div>

        {shiftExchangeNotifs.length === 0 ? (
          <p className="empty-msg">No shift exchange notifications yet.</p>
        ) : (
          <ul className="notification-list">
            {shiftExchangeNotifs
              .sort((a, b) => b.id - a.id)
              .map((note) => (
                <li
                  key={note.id}
                  className={`notification-item ${note.read ? "read" : "unread"}`}
                >
                  <div className="notif-content">
                    <User size={18} className="notif-icon" />
                    <div>
                      {/* 👇 Replace "You" with student@tut.ac.za */}
                      <p className="notif-message">
                        {note.message.replace(/\b[Yy]ou\b/, testStudentEmail)}
                      </p>
                      <span className="notif-time">{note.timestamp}</span>
                    </div>
                  </div>
                  {!note.read && (
                    <button
                      className="mark-read-btn"
                      onClick={() => markAsRead(note.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Other Admin Alerts */}
      <div className="login-notifications">
        <div className="section-header">
          <h2>
            <Bell size={20} /> Other Admin Alerts
          </h2>
          {otherNotifs.length > 0 && (
            <button className="clear-btn" onClick={clearAll}>
              <Trash2 size={18} /> Clear All
            </button>
          )}
        </div>

        {otherNotifs.length === 0 ? (
          <p className="empty-msg">No other admin notifications.</p>
        ) : (
          <ul className="notification-list">
            {otherNotifs
              .sort((a, b) => b.id - a.id)
              .map((note) => (
                <li
                  key={note.id}
                  className={`notification-item ${note.read ? "read" : "unread"}`}
                >
                  <div className="notif-content">
                    <User size={18} className="notif-icon" />
                    <div>
                      {/* 👇 Also apply replacement here */}
                      <p className="notif-message">
                        {note.message.replace(/\b[Yy]ou\b/, testStudentEmail)}
                      </p>
                      <span className="notif-time">{note.timestamp}</span>
                    </div>
                  </div>
                  {!note.read && (
                    <button
                      className="mark-read-btn"
                      onClick={() => markAsRead(note.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Send Notification Form (admin -> students) */}
      <form onSubmit={handleSendNotification} className="notification-form">
        <h2 className="form-heading">
          <Send size={18} /> Send Notification
        </h2>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            placeholder="Enter notification subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            placeholder="Enter your notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="6"
            required
          />
        </div>

        <div className="form-group">
          <label>Select Students</label>
          <div className="student-selector">
            <div className="selector-header">
              <input
                type="checkbox"
                checked={selectedStudents.length === students.length && students.length > 0}
                onChange={handleSelectAll}
              />{" "}
              Select All ({selectedStudents.length}/{students.length})
            </div>
            <div className="student-list">
              {students.map((student) => (
                <div key={student.id} className="student-item">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentSelect(student.id)}
                  />
                  <span>
                    {student.name} ({student.email})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="send-notification-btn" disabled={isSending}>
          {isSending ? (
            <>
              <span className="loading-spinner"></span> Sending...
            </>
          ) : (
            <>
              <Send size={20} /> Send Notification
            </>
          )}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.startsWith("✅") ? "success" : "error"}`}>
          {status}
        </div>
      )}
    </div>
  );
}

export default NotificationPage;
