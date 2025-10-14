import React, { useState } from "react";
import "../styles/ReportDisruption.scss";
import { AlertTriangle, MapPin, Send } from "lucide-react";

function ReportDisruption() {
  const [form, setForm] = useState({
    date: "",
    location: "",
    type: "",
    description: "",
  });

  const [submittedReport, setSubmittedReport] = useState(null); // store the last submitted report

  const disturbanceTypes = [
    "Noise Disturbance",
    "Technical Issue",
    "Maintenance Problem",
    "Misconduct",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.date || !form.location || !form.type || !form.description) {
      alert("Please fill in all required fields.");
      return;
    }

    // Store the submitted report
    setSubmittedReport(form);

    alert("✅ Disruption report submitted successfully!");
    setForm({ date: "", location: "", type: "", description: "" });
  };

  return (
    <div className="report-container">
      <div className="report-card">
        <h2 className="form-title">
          <AlertTriangle className="icon" /> Disruption Details
        </h2>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <div className="input-with-icon">
              <MapPin size={16} color="#64748b" />
              <input
                type="text"
                name="location"
                placeholder="e.g. Library Study Area, Building 54"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Type of Disturbance *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="">Select type</option>
              {disturbanceTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Describe what happened..."
              value={form.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            <Send size={18} /> Submit Report
          </button>
        </form>

        {submittedReport && (
          <div className="submitted-report">
            <h3>📄 Submitted Report</h3>
            <p><strong>Date:</strong> {submittedReport.date}</p>
            <p><strong>Location:</strong> {submittedReport.location}</p>
            <p><strong>Type:</strong> {submittedReport.type}</p>
            <p><strong>Description:</strong> {submittedReport.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportDisruption;
