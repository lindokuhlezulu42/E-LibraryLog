// src/pages/MySchedule.jsx
import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import "../styles/MySchedule.scss";

function MySchedule() {
  // Mock data for weekly schedule
  const schedule = [
    {
      id: 1,
      day: "Monday",
      title: "Mathematics Tutorial",
      time: "9:00 AM - 12:00 PM",
      location: "Room 201",
      status: "Scheduled"
    },
    {
      id: 2,
      day: "Tuesday",
      title: "Lab Assistant",
      time: "2:00 PM - 5:00 PM",
      location: "Lab 3",
      status: "Scheduled"
    },
    {
      id: 3,
      day: "Wednesday",
      title: "Library Duty",
      time: "10:00 AM - 1:00 PM",
      location: "Main Library",
      status: "Scheduled"
    },
    {
      id: 4,
      day: "Thursday",
      title: "Office Hours",
      time: "3:00 PM - 6:00 PM",
      location: "Faculty Office",
      status: "Scheduled"
    },
    {
      id: 5,
      day: "Friday",
      title: "Study Group",
      time: "9:00 AM - 11:00 AM",
      location: "Room 105",
      status: "Scheduled"
    }
  ];

  // Calculate summary stats
  const totalHours = 18; // Mock value
  const classesThisWeek = schedule.length;
  const nextClass = schedule[0]; // First item is next class (assuming sorted)

  return (
    <div className="my-schedule-page">
      <h1>Weekly Schedule</h1>
      <p>View your upcoming shifts and class schedule</p>

      <div className="schedule-container">
        {schedule.map((item) => (
          <div key={item.id} className="schedule-item">
            <div className="day-badge">{item.day}</div>
            <div className="schedule-details">
              <h3>{item.title}</h3>
              <div className="info-row">
                <span className="icon"><Clock size={16} color="#6b7280" /></span>
                <span>{item.time}</span>
              </div>
              <div className="info-row">
                <span className="icon"><MapPin size={16} color="#6b7280" /></span>
                <span>{item.location}</span>
              </div>
            </div>
            <div className="status-badge">
              {item.status}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Hours This Week</h4>
          <p className="value">{totalHours}h</p>
        </div>
        <div className="summary-card">
          <h4>Classes This Week</h4>
          <p className="value">{classesThisWeek}</p>
        </div>
        <div className="summary-card">
          <h4>Next Class</h4>
          <p className="value">{nextClass ? `${nextClass.day}, ${nextClass.time.split(' - ')[0]}` : 'No classes scheduled'}</p>
        </div>
      </div>
    </div>
  );
}

export default MySchedule;