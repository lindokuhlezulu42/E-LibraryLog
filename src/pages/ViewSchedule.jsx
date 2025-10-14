// src/pages/ViewSchedule.jsx
import React from "react";
import "../styles/ViewSchedule.scss";

function ViewSchedule() {
  // Mock data — replace with API call later
  const schedule = [
    { time: "08:00", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "" },
    { 
      time: "09:00", 
      monday: "John Doe", 
      tuesday: "Mike Johnson", 
      wednesday: "Tom Brown", 
      thursday: "", 
      friday: "Jane Smith" 
    },
    { 
      time: "10:00", 
      monday: "John Doe", 
      tuesday: "Mike Johnson", 
      wednesday: "Tom Brown", 
      thursday: "John Doe", 
      friday: "Jane Smith" 
    },
    { 
      time: "11:00", 
      monday: "John Doe", 
      tuesday: "Mike Johnson", 
      wednesday: "Tom Brown", 
      thursday: "John Doe", 
      friday: "Jane Smith" 
    },
    { time: "12:00", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "" },
    { time: "13:00", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "" },
    { time: "14:00", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "" },
    { time: "15:00", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "" },
    { time: "16:00", monday: "", tuesday: "", wednesday: "", thursday: "", friday: "" },
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="view-schedule-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Timetable</h1>
          <p className="page-subtitle">Complete schedule view for all student assistants</p>
        </div>
        <button className="manage-btn">
          ⚙️ Manage Schedules
        </button>
      </div>

      {/* Week Schedule Section */}
      <div className="week-schedule-container">
        <h2 className="section-title">Week Schedule</h2>
        <p className="section-subtitle">Current week assignments (Jan 15 - Jan 21, 2025)</p>

        {/* Schedule Grid */}
        <div className="schedule-grid">
          {/* Header Row: Days */}
          <div className="grid-header">
            <div className="time-cell">Time</div>
            {days.map((day) => (
              <div key={day} className="day-cell">{day}</div>
            ))}
          </div>

          {/* Data Rows: Time Slots */}
          {schedule.map((row, index) => (
            <div key={index} className="grid-row">
              <div className="time-cell">{row.time}</div>
              {days.map((day) => {
                const studentName = row[day.toLowerCase()];
                return (
                  <div key={day} className="schedule-cell">
                    {studentName && (
                      <div className="student-pill">
                        {studentName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewSchedule;