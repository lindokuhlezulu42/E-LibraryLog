import React, { useState, useEffect } from "react";
import "../styles/ViewLeave.scss";

function ViewLeave() {
  const [leaveRequests, setLeaveRequests] = useState([]);

  // ✅ Load leave requests from localStorage
  useEffect(() => {
    const storedRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [];
    setLeaveRequests(storedRequests);
  }, []);

  // ✅ Send student notification
  const sendNotification = (studentEmail, status, reason, startDate, endDate) => {
    const existing = JSON.parse(localStorage.getItem("studentNotifications")) || [];
    const newNotification = {
      id: Date.now(),
      title: "Leave Request Update",
      message: `Your leave request from ${startDate} to ${endDate} has been ${status.toUpperCase()}. Reason: ${reason}`,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    const updated = [newNotification, ...existing];
    localStorage.setItem("studentNotifications", JSON.stringify(updated));
  };

  // ✅ Approve handler
  const handleApprove = (id) => {
    const confirmApprove = window.confirm("Are you sure you want to approve this leave request?");
    if (!confirmApprove) return;

    const approvedRequest = leaveRequests.find((req) => req.id === id);
    if (!approvedRequest) return;

    sendNotification(
      approvedRequest.email,
      "approved",
      approvedRequest.reason,
      approvedRequest.startDate,
      approvedRequest.endDate
    );

    const updated = leaveRequests.filter((req) => req.id !== id);
    setLeaveRequests(updated);
    localStorage.setItem("leaveRequests", JSON.stringify(updated));
  };

  // ✅ Reject handler
  const handleReject = (id) => {
    const confirmReject = window.confirm("Are you sure you want to reject this leave request?");
    if (!confirmReject) return;

    const rejectedRequest = leaveRequests.find((req) => req.id === id);
    if (!rejectedRequest) return;

    sendNotification(
      rejectedRequest.email,
      "rejected",
      rejectedRequest.reason,
      rejectedRequest.startDate,
      rejectedRequest.endDate
    );

    const updated = leaveRequests.filter((req) => req.id !== id);
    setLeaveRequests(updated);
    localStorage.setItem("leaveRequests", JSON.stringify(updated));
  };

  return (
    <div className="leave-request-page">
      <h1 className="page-title">All Leave Requests</h1>
      <p className="page-subtitle">Student assistants requesting time off</p>

      <div className="leave-table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No leave requests yet.
                </td>
              </tr>
            ) : (
              leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.email}</td>
                  <td>{request.startDate}</td>
                  <td>{request.endDate}</td>
                  <td>{request.reason}</td>
                  <td>{request.type}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewLeave;
