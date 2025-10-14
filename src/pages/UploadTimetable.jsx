// src/pages/UploadTimetable.jsx
import React, { useState } from "react";
import axios from "axios";
import { Upload } from "lucide-react";
import "../styles/UploadTimetable.scss";

function UploadTimetable() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      validateAndUpload(selectedFile);
    }
  };

  const validateAndUpload = async (file) => {
    const allowed = ["pdf", "jpg", "png", "xlsx", "xls", "csv"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      return setStatus("❌ Invalid file type. Allowed: PDF, JPG, PNG, XLSX, CSV");
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return setStatus("❌ File too large. Maximum size: 10MB");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:8080/api/timetable/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("✅ Timetable uploaded successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload failed. Try again later.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      validateAndUpload(droppedFile);
    }
  };

  return (
    <div className="upload-page">
      <h1>Upload Timetable</h1>
      <p>Upload your class timetable for better schedule management</p>

      {/* Upload Card */}
      <div 
        className="upload-card"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <Upload size={32} color="#667eea" />
        </div>
        <h3>Drop your timetable here</h3>
        <p className="supported-formats">Supported formats: PDF, Excel, CSV, Image</p>
        
        <label className="choose-file-btn">
          Choose File
          <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.png,.jpeg,.xlsx,.xls,.csv" />
        </label>
      </div>

      {/* Guidelines */}
      <div className="guidelines-card">
        <h3>Upload Guidelines:</h3>
        <ul>
          <li>Ensure your timetable is clear and readable</li>
          <li>Include all class times, locations, and course codes</li>
          <li>Maximum file size: 10MB</li>
          <li>The system will automatically parse your timetable</li>
          <li>You can update your timetable anytime</li>
        </ul>
      </div>

      {/* Status Message */}
      {status && <p className={`status ${status.startsWith('✅') ? 'success' : 'error'}`}>{status}</p>}
    </div>
  );
}

export default UploadTimetable;