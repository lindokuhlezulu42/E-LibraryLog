import React, { useState, useContext } from "react";
import "../styles/ReportDisruption.scss";
import { AlertTriangle, MapPin, Send } from "lucide-react";
import { ReportContext } from "../context/ReportContext";

function ReportDisruption() {
  const [form, setForm] = useState({
    date: "",
    location: "",
    type: "",
    description: "",
  });

  const { addReport } = useContext(ReportContext); // ✅ access addReport

  const disturbanceTypes = [
    "Protest",
    "Technical Issue",
    "Maintenance Problem",
    "Library renovation",
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

    // ✅ Add report to context
    addReport(form);

    // ✅ Send notification to students
    const existingNotifications =
      JSON.parse(localStorage.getItem("studentNotifications")) || [];
    const newNotification = {
      id: Date.now(),
      title: "New Disruption Report",
      message: `A new ${form.type} has been reported at ${form.location} on ${form.date}. Description: ${form.description}`,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    localStorage.setItem(
      "studentNotifications",
      JSON.stringify([newNotification, ...existingNotifications])
    );

    alert("✅ Disruption report submitted successfully! Students have been notified.");

    // Reset form
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
      </div>
    </div>
  );
}

export default ReportDisruption;
