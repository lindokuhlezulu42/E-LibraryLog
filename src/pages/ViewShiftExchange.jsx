

// src/pages/ViewShiftExchange.jsx
import React, { useState, useEffect } from "react";
import { FileText, User, Calendar, X } from "lucide-react";
import "../styles/ViewShiftExchange.scss";
import { useNavigate } from "react-router-dom";

function ViewShiftExchange() {
  const navigate = useNavigate();
  const [shiftExchanges, setShiftExchanges] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🧠 Fetch real shift exchange data live from localStorage
  useEffect(() => {
    const fetchData = () => {
      const stored = JSON.parse(localStorage.getItem("shiftExchanges")) || [];
      // Sort latest first
      const sorted = stored.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setShiftExchanges(sorted);
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // refresh every 3s
    return () => clearInterval(interval);
  }, []);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="shift-exchange-page">
      <h1 className="page-title">All Shift Exchanges</h1>
      <p className="page-subtitle">
        Manage shift swap requests between student assistants
      </p>

      <div className="exchange-table-container">
        <table className="exchange-table">
          <thead>
            <tr>
              <th>Requester</th>
              <th>Recipient</th>
              <th>Your Shift</th>
              <th>Their Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shiftExchanges.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#888" }}>
                  No shift exchanges yet.
                </td>
              </tr>
            ) : (
              shiftExchanges.map((exchange) => (
                <tr key={exchange.id}>
                  <td>
  <div className="student-info">
    <User size={16} color="#6b7280" />
    <span>student@tut.ac.za</span>
  </div>
</td>
                  <td>
                    <div className="student-info">
                      <User size={16} color="#6b7280" />
                      <span>{exchange.toEmail || exchange.to}</span>
                    </div>
                  </td>
                  <td>
                    {exchange.yourShift
                      ? `${exchange.yourShift.date} ${exchange.yourShift.time}`
                      : "—"}
                  </td>
                  <td>
                    {exchange.theirShift
                      ? `${exchange.theirShift.date} ${exchange.theirShift.time}`
                      : "—"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${exchange.status.toLowerCase()}`}
                    >
                      {exchange.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(exchange)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Shift Exchange Details */}
      {isModalOpen && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCloseModal}>
              <X size={20} />
            </button>

            <h2 className="modal-title">Shift Exchange Details</h2>
            <p className="modal-subtitle">Review the request</p>

            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-label">Requester</div>
                <div className="detail-value">
                  {selectedRequest.fromEmail || `${selectedRequest.from}@tut.ac.za`}
                </div>
              </div>
<div className="detail-row">
  <div className="detail-label">Requester</div>
  <div className="detail-value">student@tut.ac.za</div>
</div>

              <div className="detail-row">
                <div className="detail-label">Your Shift</div>
                <div className="detail-value">
                  {selectedRequest.yourShift
                    ? `${selectedRequest.yourShift.date} • ${selectedRequest.yourShift.time} • ${selectedRequest.yourShift.location}`
                    : "N/A"}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Their Shift</div>
                <div className="detail-value">
                  {selectedRequest.theirShift
                    ? `${selectedRequest.theirShift.date} • ${selectedRequest.theirShift.time} • ${selectedRequest.theirShift.location}`
                    : "N/A"}
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Status</div>
                <div className="detail-value">{selectedRequest.status}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Timestamp</div>
                <div className="detail-value">
                  {new Date(selectedRequest.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="modal-actions">
                <button className="close-modal-btn" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewShiftExchange;

