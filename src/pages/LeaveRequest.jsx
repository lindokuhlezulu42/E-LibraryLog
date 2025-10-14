import React, { useState } from "react";
import { Calendar, Send, FileText } from "lucide-react";
import "../styles/LeaveRequest.scss";

function LeaveRequest() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Mock data for request history
  const requestHistory = [
    { id: 1, date: "2025-10-15", reason: "Medical appointment", status: "Pending" },
    { id: 2, date: "2025-09-28", reason: "Family emergency", status: "Approved" }
  ];

  const handleSendRequest = (e) => {
    e.preventDefault();

    if (!startDate || !endDate || !reason) {
      return setStatus("Please fill in all required fields.");
    }

    if (new Date(startDate) > new Date(endDate)) {
      return setStatus("Start date must be before end date.");
    }

    setTimeout(() => {
      setStatus("✅ Leave request submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReason("");
    }, 500);
  };

  const handleCancelRequest = (id) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      setStatus("✅ Request cancelled successfully!");
    }
  };

  return (
    <div className="leave-request-page">
      <h1>Leave Request</h1>
      <p>Submit and manage your leave requests</p>

      <div className="request-container">
        {/* Left Card: Submit New Request */}
        <div className="new-request-card">
          <h2><Calendar size={22} /> Submit New Request</h2>
          <form onSubmit={handleSendRequest}>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}   // 👈 Prevents past dates
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}  // 👈 Prevents selecting before startDate
                required
              />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <textarea
                placeholder="Please provide a reason for your leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                required
              />
            </div>
            <button type="submit" className="submit-request-btn">
              <Send size={20} /> Submit Request
            </button>
          </form>
        </div>

        {/* Right Card: Request History */}
        <div className="history-card">
          <h2><FileText size={22} /> Request History</h2>
          {requestHistory.length === 0 ? (
            <p className="no-requests">No leave requests yet.</p>
          ) : (
            <div className="requests-list">
              {requestHistory.map((req) => (
                <div key={req.id} className={`request-item ${req.status.toLowerCase()}`}>
                  <div className="request-header">
                    <div className="date-info">
                      <Calendar size={18} color="#6b7280" />
                      <span>{req.date}</span>
                    </div>
                    <span className="reason-text">{req.reason}</span>
                    <div className="action-buttons">
                      {req.status === "Pending" && (
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelRequest(req.id)}
                        >
                          × Cancel
                        </button>
                      )}
                      {req.status === "Approved" && (
                        <span className="status-badge approved">Approved</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <p className={`status ${status.startsWith('✅') ? 'success' : 'error'}`}>
          {status}
        </p>
      )}
    </div>
  );
}

export default LeaveRequest;
