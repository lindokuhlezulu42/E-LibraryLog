// src/pages/ViewShiftExchange.jsx
import React from "react";
import { FileText, Clock, User, Calendar } from "lucide-react";
import "../styles/ViewShiftExchange.scss";

function ViewShiftExchange() {
  // Mock data — replace with API call later
  const shiftExchanges = [
    {
      id: 1,
      requester: "John Doe",
      date: "2025-02-15",
      time: "09:00 - 17:00",
      reason: "Medical appointment conflict",
      status: "pending",
    },
    {
      id: 2,
      requester: "Jane Smith",
      date: "2025-02-18",
      time: "13:00 - 21:00",
      reason: "Academic exam scheduled",
      status: "pending",
    },
    {
      id: 3,
      requester: "Mike Johnson",
      date: "2025-02-10",
      time: "09:00 - 17:00",
      reason: "Family event",
      status: "approved",
    },
    {
      id: 4,
      requester: "Sarah Williams",
      date: "2025-02-20",
      time: "10:00 - 18:00",
      reason: "Personal emergency",
      status: "pending",
    },
  ];

  const handleApprove = (id) => {
    console.log("Approve shift exchange:", id);
    // TODO: Add API call
  };

  const handleReject = (id) => {
    console.log("Reject shift exchange:", id);
    // TODO: Add API call
  };

  return (
    <div className="shift-exchange-page">
      <h1 className="page-title">Shift Exchange Requests</h1>
      <p className="page-subtitle">
        Review shift exchange requests and find replacements
      </p>

      <div className="exchange-table-container">
        <h2 className="section-title">All Shift Exchanges</h2>
        <p className="section-subtitle">
          Manage shift swaps between student assistants
        </p>

        <table className="exchange-table">
          <thead>
            <tr>
              <th>Requester</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shiftExchanges.map((exchange) => (
              <tr key={exchange.id}>
                <td>
                  <div className="student-info">
                    <User size={16} color="#94a3b8" />
                    <span>{exchange.requester}</span>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <Calendar size={16} color="#94a3b8" />
                    <span>{exchange.date}</span>
                  </div>
                </td>
                <td>
                  <div className="time-info">
                    <Clock size={16} color="#94a3b8" />
                    <span>{exchange.time}</span>
                  </div>
                </td>
                <td>
                  <div className="reason-info">
                    <FileText size={16} color="#94a3b8" />
                    <span>{exchange.reason}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${exchange.status}`}>
                    {exchange.status}
                  </span>
                </td>
                <td>
                  {/* Always show Approve and Reject buttons */}
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(exchange.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(exchange.id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewShiftExchange;
