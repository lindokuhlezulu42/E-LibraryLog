import React, { useState } from "react";
import { Upload, Send } from "lucide-react";
import "../styles/UploadProofPage.scss";

function UploadProofPage() {
  const [proofFile, setProofFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setProofFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!proofFile) {
      alert("Please upload a PDF proof file.");
      return;
    }

    // ✅ Save admin notification
    const existingAdminNotifs =
      JSON.parse(localStorage.getItem("adminNotifications")) || [];

    const newNotification = {
      id: Date.now(),
      title: "Sick Proof Submitted",
      message: `A student has uploaded a sick proof document: "${proofFile.name}".`,
      timestamp: new Date().toLocaleString(),
      read: false,
    };

    localStorage.setItem(
      "adminNotifications",
      JSON.stringify([newNotification, ...existingAdminNotifs])
    );

    alert(`File "${proofFile.name}" submitted successfully! Admin has been notified.`);
    setProofFile(null);
  };

  return (
    <div className="upload-proof-page">
      <div className="container">
        <h1>Submit Proof Document</h1>
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group upload-proof">
            <label>Upload Proof</label>
            <div className="upload-box">
              <Upload size={24} color="#004E97" />
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                required
              />
              {proofFile ? (
                <span className="file-name">{proofFile.name}</span>
              ) : (
                <span className="placeholder">No file selected</span>
              )}
            </div>
          </div>

          <button type="submit" className="submit-request-btn">
            <Send size={20} /> Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadProofPage;
