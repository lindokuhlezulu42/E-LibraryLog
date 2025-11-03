// src/pages/HoursWorked.jsx
import React, { useState, useEffect } from "react";
import "../styles/StudentAssistantHours.scss";

function StudentAssistantHours() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );
  const [hoursData, setHoursData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for student assistant hours
  const mockHoursData = [
    { id: 1, name: "Alice Johnson", hours: 15 },
    { id: 2, name: "Bob Williams", hours: 18 },
    { id: 3, name: "Charlie Brown", hours: 12 },
    { id: 4, name: "Diana Prince", hours: 16 },
    { id: 5, name: "Eve Adams", hours: 14 },
  ];

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setHoursData(mockHoursData);
      setLoading(false);
    }, 800);
  }, [selectedMonth]);

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  if (loading) {
    return (
      <div className="student-assistant-hours-page">
        <div className="page-header">
          <h1>Student Assistant Hours</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student assistant hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-assistant-hours-page">
      {/* Header */}
      <div className="page-header">
        <h1>Student Assistant Hours</h1>

        {/* Month Selector */}
        <div className="month-selector">
          <label htmlFor="month-select">Select Month:</label>
          <select 
            id="month-select" 
            value={selectedMonth} 
            onChange={handleMonthChange}
          >
            {[...Array(12)].map((_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthStr = date.toISOString().substring(0, 7);
              return (
                <option key={monthStr} value={monthStr}>
                  {formatMonth(monthStr)}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="hours-container">
        <div className="hours-header">
          <div className="header-item">ASSISTANT</div>
          <div className="header-item">HOURS WORKED</div>
        </div>
        
        <div className="hours-list">
          {hoursData.map((assistant) => (
            <div key={assistant.id} className="hours-item">
              <div className="assistant-info">
                <div className="avatar-empty"></div>
                <span className="assistant-name">{assistant.name}</span>
              </div>
              <div className="hours-value">
                {assistant.hours} hrs
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentAssistantHours;

