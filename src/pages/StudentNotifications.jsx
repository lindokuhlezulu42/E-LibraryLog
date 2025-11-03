// src/pages/StudentNotifications.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Bell, Trash2 } from "lucide-react";
import "../styles/StudentNotifications.scss";

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load all notifications (regular + shift exchange requests)
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

  // ✅ Mark single notification as read (now works properly)
  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);

    // Save regular notifications (non-shift) back to localStorage
    const regularNotes = updated.filter((n) => !n.title.includes("Shift Exchange"));
    localStorage.setItem("studentNotifications", JSON.stringify(regularNotes));

    // Save shift exchange requests separately
    const shiftNotes = updated.filter((n) => n.title.includes("Shift Exchange"));
    const shiftRequests = shiftNotes.map((s) => ({
      id: s.id,
      myShift: "", // optional if you want to store shift info again
      requestedShift: "",
      reason: "",
    }));
    localStorage.setItem("shiftExchangeRequests", JSON.stringify(shiftRequests));

    // 🟢 Trigger event so dashboard bell count updates instantly
    window.dispatchEvent(new Event("storage"));
  };

  // ✅ Clear all notifications
  const clearAll = () => {
    localStorage.removeItem("studentNotifications");
    localStorage.removeItem("shiftExchangeRequests");
    setNotifications([]);

    // 🟢 Trigger event so bell count updates
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="student-notifications-page-wrapper">
      <Sidebar />
      <div className="student-notifications-page">
        <div className="page-title">
          <h1>Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <p className="empty-msg">No notifications.</p>
        ) : (
          <>
            <button className="clear-btn" onClick={clearAll}>
              <Trash2 size={18} /> Clear All
            </button>
            <ul className="notification-list">
              {notifications.map((note) => (
                <li
                  key={note.id}
                  className={`notification-item ${note.read ? "read" : "unread"}`}
                >
                  <div className="notif-info">
                    <h3>{note.title}</h3>
                    <p>{note.message}</p>
                    <span className="timestamp">{note.timestamp}</span>
                  </div>
                  {!note.read && (
                    <div className="notif-actions">
                      <button
                        className="mark-read-btn"
                        onClick={() => markAsRead(note.id)}
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentNotifications;
