import React, { useState, useEffect } from "react";
import { Calendar, Send } from "lucide-react";
import "../styles/LeaveRequest.scss";

function LeaveRequest() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [campus, setCampus] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // ✅ Load logged-in user's campus
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.campus) {
      setCampus(storedUser.campus);
    }
  }, []);

  const handleSendRequest = (e) => {
    e.preventDefault();

    if (!leaveType || !startDate || !endDate || !reason) {
      return setStatus("Please fill in all required fields.");
    }

    if (new Date(startDate) > new Date(endDate)) {
      return setStatus("Start date must be before end date.");
    }

    const studentEmail = "student@tut.ac.za";
    const existingRequests =
      JSON.parse(localStorage.getItem("leaveRequests")) || [];

    const newRequest = {
      id: Date.now(),
      email: studentEmail,
      campus,
      startDate,
      endDate,
      reason,
      type: leaveType,
      status: "pending",
    };

    localStorage.setItem(
      "leaveRequests",
      JSON.stringify([...existingRequests, newRequest])
    );

    setStatus("✅ Leave request submitted successfully!");
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  // ✅ Restrict access for Polokwane campus
  if (campus === "Polokwane") {
    return (
      <div className="leave-request-page restricted">
        <h1>Leave Request</h1>
        <p>🚫 Access Denied</p>
        <p>Leave requests are not available for the Polokwane campus.</p>
      </div>
    );
  }

  // ✅ Show form only for Emalahleni campus
  if (campus === "eMalahleni" || campus === "Emalahleni") {
    return (
      <div className="leave-request-page">
        <h1>Leave Request</h1>
        <p>Submit and manage your leave requests</p>

        <div className="request-container">
          <div className="new-request-card">
            <h2>
              <Calendar size={22} /> Submit New Request
            </h2>
            <form onSubmit={handleSendRequest}>
              <div className="form-group">
                <label>Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                >
                  <option value="">-- Select Leave Type --</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Family Responsibility Leave">
                    Family Responsibility Leave
                  </option>
                  <option value="Study Leave">Study Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
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
        </div>

        {status && (
          <p className={`status ${status.startsWith("✅") ? "success" : "error"}`}>
            {status}
          </p>
        )}
      </div>
    );
  }

  // ✅ If no user found or campus missing
  return (
    <div className="leave-request-page">
      <p>Loading campus information...</p>
    </div>
  );
}

export default LeaveRequest;
