// src/pages/ShiftExchange.jsx
import React, { useState } from "react";
import { ArrowLeftRight, Send, User, Calendar, FileText } from "lucide-react";
import "../styles/ShiftExchange.scss";

function ShiftExchange() {
  const [currentShift, setCurrentShift] = useState("");
  const [requestedShift, setRequestedShift] = useState("");
  const [reason, setReason] = useState(""); // For custom reason
  const [selectedReason, setSelectedReason] = useState(""); // Dropdown selected value
  const [status, setStatus] = useState("");

  const validReasons = [
    "Medical Appointment",
    "Family Commitment",
    "Academic Engagement",
    "Personal Emergency",
    "Other"
  ];

  // Mock data for exchange requests
  const exchangeRequests = [
    {
      id: 1,
      name: "John Doe",
      status: "Pending",
      myShift: "Monday, 9:00 AM - 12:00 PM",
      theirShift: "Wednesday, 2:00 PM - 5:00 PM",
      reason: "Medical Appointment"
    },
    {
      id: 2,
      name: "Jane Smith",
      status: "Approved",
      myShift: "Tuesday, 1:00 PM - 4:00 PM",
      theirShift: "Thursday, 8:00 AM - 11:00 AM",
      reason: "Family Commitment"
    }
  ];

  const handleSendRequest = (e) => {
    e.preventDefault();

    if (!currentShift || !requestedShift || (!selectedReason && selectedReason !== "Other")) {
      return setStatus("Please fill in all required fields.");
    }

    let finalReason = selectedReason === "Other" ? reason : selectedReason;

    if (!finalReason) {
      return setStatus("Please provide a reason for your shift request.");
    }

    // Simulate API call
    setTimeout(() => {
      setStatus("✅ Request sent successfully!");
      setCurrentShift("");
      setRequestedShift("");
      setSelectedReason("");
      setReason("");
    }, 500);
  };

  return (
    <div className="shift-exchange-page">
      <h1>Shift Exchange</h1>
      <p>Request to exchange shifts with other students</p>

      <div className="exchange-container">
        {/* Left Card: New Exchange Request */}
        <div className="new-request-card">
          <h2><ArrowLeftRight size={20} /> New Exchange Request</h2>

          <form onSubmit={handleSendRequest}>
            <div className="form-group">
              <label>My Current Shift</label>
              <select 
                value={currentShift} 
                onChange={(e) => setCurrentShift(e.target.value)}
                required
              >
                <option value="">Select your shift</option>
                <option value="mon-9am">Monday, 9:00 AM - 12:00 PM</option>
                <option value="tue-1pm">Tuesday, 1:00 PM - 4:00 PM</option>
                <option value="wed-2pm">Wednesday, 2:00 PM - 5:00 PM</option>
                <option value="thu-8am">Thursday, 8:00 AM - 11:00 AM</option>
                <option value="fri-10am">Friday, 10:00 AM - 1:00 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label>Requested Shift</label>
              <select 
                value={requestedShift} 
                onChange={(e) => setRequestedShift(e.target.value)}
                required
              >
                <option value="">Select requested shift</option>
                <option value="mon-9am">Monday, 9:00 AM - 12:00 PM</option>
                <option value="tue-1pm">Tuesday, 1:00 PM - 4:00 PM</option>
                <option value="wed-2pm">Wednesday, 2:00 PM - 5:00 PM</option>
                <option value="thu-8am">Thursday, 8:00 AM - 11:00 AM</option>
                <option value="fri-10am">Friday, 10:00 AM - 1:00 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reason for Shift Request</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                required
              >
                <option value="">Select reason</option>
                {validReasons.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {selectedReason === "Other" && (
              <div className="form-group">
                <label>Specify Reason</label>
                <textarea
                  placeholder="Type your reason here..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  required
                />
              </div>
            )}

            <button type="submit" className="send-request-btn">
              <Send size={18} /> Send Request
            </button>
          </form>
        </div>

        {/* Right Card: Exchange Requests */}
        <div className="requests-card">
          <h2><User size={20} /> Exchange Requests</h2>

          {exchangeRequests.length === 0 ? (
            <p className="no-requests">No exchange requests yet.</p>
          ) : (
            <div className="requests-list">
              {exchangeRequests.map((req) => (
                <div key={req.id} className={`request-item ${req.status.toLowerCase()}`}>
                  <div className="request-header">
                    <span className="request-name">With: {req.name}</span>
                    <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
                  </div>
                  <div className="shift-details">
                    <div className="shift-row">
                      <Calendar size={16} />
                      <span>Your shift: {req.myShift}</span>
                    </div>
                    <div className="shift-row">
                      <ArrowLeftRight size={16} />
                      <span>Their shift: {req.theirShift}</span>
                    </div>
                    <div className="shift-row">
                      <FileText size={16} />
                      <span>Reason: {req.reason}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {status && <p className={`status ${status.startsWith("✅") ? "success" : "error"}`}>{status}</p>}
    </div>
  );
}

export default ShiftExchange;
