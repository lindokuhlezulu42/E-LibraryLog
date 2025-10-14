// src/pages/AddStudentAssistant.jsx
import React, { useState } from "react";
import { UserPlus, Mail, Phone, Calendar, MapPin } from "lucide-react";
import "../styles/AddStudentAssistant.scss";

function AddStudentAssistant() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    department: "",
    accommodation: "",
    year: "",
    startDate: "",
    endDate: "",
  });

  const [status, setStatus] = useState("");

  const departments = [
    "Computer Science",
    "Engineering",
    "Business",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Psychology",
  ];

  const accommodations = ["Building 54", "Corridor Hill", "Khayalethu"];
  const years = ["1", "2", "3", "4", "5"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent non-digit input for phone and student ID
    if (name === "phone" || name === "studentId") {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Required fields check
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.studentId) {
      return setStatus("⚠️ Please fill in all required fields.");
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setStatus("⚠️ Please enter a valid email address.");
    }

    // Phone number validation (if provided)
    if (formData.phone && formData.phone.length !== 10) {
      return setStatus("⚠️ Phone number must contain exactly 10 digits.");
    }

    // Student ID validation
    if (formData.studentId.length !== 9) {
      return setStatus("⚠️ Student ID must contain exactly 9 digits.");
    }

    // Simulate API call
    setTimeout(() => {
      setStatus("✅ Student assistant added successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        studentId: "",
        department: "",
        accommodation: "",
        year: "",
        startDate: "",
        endDate: "",
      });
    }, 500);
  };

  return (
    <div className="add-student-assistant-page">
      <h1>Add Student Assistant</h1>
      <p>Register a new student assistant to the system</p>

      <div className="form-container">
        <h2>
          <UserPlus size={22} /> Student Information
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <div className="input-with-icon">
                <Mail size={16} color="#6b7280" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@university.edu"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <Phone size={16} color="#6b7280" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 0712345678"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Student ID *</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                placeholder="e.g. 202312345"
                maxLength={9}
                required
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="">Select department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Accommodation</label>
              <div className="input-with-icon">
                <MapPin size={16} color="#6b7280" />
                <select
                  name="accommodation"
                  value={formData.accommodation}
                  onChange={handleInputChange}
                >
                  <option value="">Select accommodation</option>
                  {accommodations.map((acc, index) => (
                    <option key={index} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
              >
                <option value="">Select year</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <div className="input-with-icon">
                <Calendar size={16} color="#6b7280" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>End Date</label>
              <div className="input-with-icon">
                <Calendar size={16} color="#6b7280" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            <UserPlus size={18} /> Add Student Assistant
          </button>
        </form>
      </div>

      {status && (
        <p
          className={`status-message ${
            status.startsWith("✅") ? "success" : "error"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default AddStudentAssistant;
