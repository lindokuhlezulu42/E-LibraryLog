// src/pages/ViewLeave.jsx
import React from "react";
import { Calendar, FileText } from "lucide-react";
import "../styles/ViewLeave.scss";

function ViewLeave() {
  // Mock data — replace with API call later
  const leaveRequests = [
    {
      id: 1,
      student: "John Doe",
      startDate: "2025-02-01",
      endDate: "2025-02-03",
      reason: "Medical appointment",
      status: "pending",
    },
    {
      id: 2,
      student: "Jane Smith",
      startDate: "2025-02-05",
      endDate: "2025-02-05",
      reason: "Family emergency",
      status: "pending",
    },
    {
      id: 3,
      student: "Mike Johnson",
      startDate: "2025-01-20",
      endDate: "2025-01-22",
      reason: "Personal reasons",
      status: "approved",
    },
    {
      id: 4,
      student: "Sarah Williams",
      startDate: "2025-02-10",
      endDate: "2025-02-12",
      reason: "Academic conference",
      status: "pending",
    },
  ];

  const handleApprove = (id) => {
    console.log("Approve leave request:", id);
    // TODO: Add API call
  };

  const handleReject = (id) => {
    console.log("Reject leave request:", id);
    // TODO: Add API call
  };

  return (
    <div className="leave-request-page">
      <h1 className="page-title">All Leave Requests</h1>
      <p className="page-subtitle">Student assistants requesting time off</p>

      <div className="leave-table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request.id}>
                <td>
                  <div className="student-info">
                    <FileText size={16} color="#94a3b8" />
                    <span>{request.student}</span>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <Calendar size={16} color="#94a3b8" />
                    <span>{request.startDate}</span>
                  </div>
                </td>
                <td>
                  <div className="date-info">
                    <Calendar size={16} color="#94a3b8" />
                    <span>{request.endDate}</span>
                  </div>
                </td>
                <td>{request.reason}</td>
                <td>
                  <span className={`status-badge ${request.status}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="approve-btn" 
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-btn" 
                    onClick={() => handleReject(request.id)}
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

export default ViewLeave;