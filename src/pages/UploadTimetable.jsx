import React, { useState } from "react";
import { Upload } from "lucide-react";
import "../styles/UploadTimetable.scss";

function UploadTimetable() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("");
    }
  };

  const handleUpload = () => {
    if (!file) {
      return setStatus("❌ Please select a file first.");
    }

    const allowedExtensions = ["pdf", "jpg", "png", "jpeg", "xlsx", "xls", "csv"];
    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return setStatus(
        "❌ Invalid file type. Allowed: PDF, JPG, PNG, XLSX, CSV"
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return setStatus("❌ File too large. Maximum size: 10MB");
    }

    // Simulate upload success
    setTimeout(() => {
      setStatus("✅ Timetable uploaded successfully!");

      // Save admin notification in localStorage
      const adminNotifications =
        JSON.parse(localStorage.getItem("adminNotifications")) || [];
      const newAdminNotification = {
        id: Date.now(),
        message: `Student uploaded a new timetable: ${file.name}`,
        timestamp: new Date().toLocaleString(),
        read: false,
      };
      localStorage.setItem(
        "adminNotifications",
        JSON.stringify([newAdminNotification, ...adminNotifications])
      );

      setFile(null);
    }, 600);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStatus("");
    }
  };

  return (
    <div className="upload-page">
      <h1>Upload Timetable</h1>
      <p>Upload your class timetable for better schedule management</p>

      <div
        className={`upload-card ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <Upload size={32} />
        </div>
        <h3>Drop your timetable here</h3>
        <p className="supported-formats">
          Supported formats: PDF, Excel, CSV, Image
        </p>

        <label className="choose-file-btn">
          Choose File
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png,.jpeg,.xlsx,.xls,.csv"
          />
        </label>

        <button className="upload-btn" onClick={handleUpload}>
          Upload
        </button>

        {file && <p className="selected-file">Selected file: {file.name}</p>}
      </div>

      <div className="guidelines-card">
        <h3>Upload Guidelines:</h3>
        <ul>
          <li>Ensure your timetable is clear and readable</li>
          <li>Include all class times, locations, and course codes</li>
          <li>Maximum file size: 10MB</li>
          <li>The system will automatically notify the admin of your upload</li>
          <li>You can update your timetable anytime</li>
        </ul>
      </div>

      {status && (
        <p className={`status ${status.startsWith("✅") ? "success" : "error"}`}>
          {status}
        </p>
      )}
    </div>
  );
}

export default UploadTimetable;