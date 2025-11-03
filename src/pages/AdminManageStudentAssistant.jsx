import React, { useState } from "react";
import { Trash2, Search, UserPlus, Mail, MapPin } from "lucide-react";
import "../styles/AdminManageStudentAssistant.scss";

// Dummy sendEmail function (replace with real API or service)
const sendEmail = (to, subject, body) => {
  console.log("Sending email to:", to);
  console.log("Subject:", subject);
  console.log("Body:", body);
  // Implement actual email logic here using EmailJS, Nodemailer, or Firebase Function
};

function AdminManageStudentAssistant() {
  const [search, setSearch] = useState("");
  const [assistants, setAssistants] = useState([
    { id: 1, name: "Nomusa Dlamini", email: "20632514@tut.ac.za", location: "Library" },
    { id: 2, name: "Thabo Nkosi", email: "21536245@tut.ac.za", location: "Computer Lab" },
    { id: 3, name: "Zanele Mthethwa", email: "23156485@tut.ac.za", location: "Lecture Hall" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    studentNumber: "",
    studentEmail: "",
    location: "",
    campus: "",
  });

  const [status, setStatus] = useState("");

  const locations = ["Library", "Computer Lab", "Lecture Hall", "Cafeteria"];
  const campuses = ["Polokwane", "Emalahleni"];

  // Filter based on search
  const filteredAssistants = assistants.filter((assistant) =>
    assistant.name.toLowerCase().includes(search.toLowerCase())
  );

  // Remove student assistant
  const handleRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this assistant?")) {
      setAssistants(assistants.filter((assistant) => assistant.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "studentNumber" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, surname, studentNumber, studentEmail, location, campus } = formData;

    if (!name || !surname || !studentNumber || !studentEmail || !location || !campus) {
      return setStatus("⚠️ Please fill in all fields.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
      return setStatus("⚠️ Please enter a valid email address.");
    }

    if (studentNumber.length !== 9) {
      return setStatus("⚠️ Student number must contain exactly 9 digits.");
    }

    setTimeout(() => {
      const newAssistant = {
        id: assistants.length + 1,
        name: `${name} ${surname}`,
        email: studentEmail,
        location: location,
      };
      setAssistants([...assistants, newAssistant]);
      setStatus("✅ Student assistant added successfully!");

      // ✅ Send email notification
      sendEmail(
        studentEmail,
        "Welcome as a Student Assistant",
        `Hello ${name},\n\nYou have been registered as a student assistant for the ${location} location.\n\nRegards,\nAdmin`
      );

      setFormData({
        name: "",
        surname: "",
        studentNumber: "",
        studentEmail: "",
        location: "",
        campus: "",
      });
    }, 500);
  };

  return (
    <div className="manage-assistant-page">
      <h2>Manage Student Assistants</h2>
      <p>Add new assistants or manage existing ones</p>

      {/* Add Form */}
      <div className="form-container">
        <h3>Add Student Assistant</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                required
              />
            </div>

            <div className="form-group">
              <label>Surname *</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                placeholder="Enter surname"
                required
              />
            </div>

            <div className="form-group">
              <label>Student Number *</label>
              <input
                type="text"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleInputChange}
                placeholder="e.g. 202312345"
                maxLength={9}
                required
              />
            </div>

            <div className="form-group">
              <label>Student Email *</label>
              <div className="input-with-icon">
                <Mail size={16} color="#6b7280" />
                <input
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleInputChange}
                  placeholder="e.g. 223425676@tut.ac.za"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <div className="input-with-icon circular">
                <MapPin size={16} color="#6b7280" />
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  style={{ textAlign: "center", borderRadius: "9999px" }}
                >
                  <option value="">Select location</option>
                  {locations.map((loc, idx) => (
                    <option key={idx} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Campus *</label>
              <div className="input-with-icon circular">
                <MapPin size={16} color="#6b7280" />
                <select
                  name="campus"
                  value={formData.campus}
                  onChange={handleInputChange}
                  required
                  style={{ textAlign: "center", borderRadius: "9999px" }}
                >
                  <option value="">Select campus</option>
                  {campuses.map((camp, idx) => (
                    <option key={idx} value={camp}>
                      {camp}
                    </option>
                  ))}
                </select>
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
          className={`status-message ${status.startsWith("✅") ? "success" : "error"}`}
        >
          {status}
        </p>
      )}

      {/* Manage Section */}
      <div className="search-bar">
        <Search className="icon" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="assistant-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssistants.length > 0 ? (
            filteredAssistants.map((assistant, index) => (
              <tr key={assistant.id}>
                <td>{index + 1}</td>
                <td>{assistant.name}</td>
                <td>{assistant.email}</td>
                <td>{assistant.location}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(assistant.id)}
                  >
                    <Trash2 size={18} /> Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">
                No assistants found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminManageStudentAssistant;
