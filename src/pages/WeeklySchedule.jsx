import React from "react";
import "../styles/WeeklySchedule.scss";

const timetable = {
  Monday: {
    "08:00": [{ name: "John", venue: "icenter" }],
    "09:00": [{ name: "Anna", venue: "circular2" }],
    "10:00": [{ name: "Mike", venue: "icenter" }],
    "11:00": [{ name: "John", venue: "icenter" }],
    "13:00": [{ name: "Tom", venue: "circular2" }],
  },
  Tuesday: {
    "08:00": [{ name: "Jane", venue: "icenter" }],
    "09:00": [{ name: "Emily", venue: "circular2" }],
    "12:00": [{ name: "Tom", venue: "icenter" }],
    "14:00": [{ name: "John", venue: "circular2" }],
  },
  Wednesday: {
    "10:00": [{ name: "Anna", venue: "icenter" }],
    "11:00": [{ name: "Jane", venue: "circular2" }],
    "13:00": [{ name: "Mike", venue: "icenter" }],
    "15:00": [{ name: "Emily", venue: "circular2" }],
  },
  Thursday: {
    "08:00": [{ name: "John", venue: "icenter" }],
    "09:00": [{ name: "Anna", venue: "circular2" }],
    "10:00": [{ name: "Tom", venue: "icenter" }],
    "11:00": [{ name: "Emily", venue: "circular2" }],
    "13:00": [{ name: "Jane", venue: "icenter" }],
  },
  Friday: {
    "08:00": [{ name: "Tom", venue: "icenter" }],
    "09:00": [{ name: "Emily", venue: "circular2" }],
    "10:00": [{ name: "Mike", venue: "icenter" }],
    "14:00": [{ name: "Anna", venue: "circular2" }],
    "16:00": [{ name: "John", venue: "icenter" }],
  },
  Saturday: {
    "08:00": [{ name: "Tom", venue: "icenter" }],
    "09:00": [{ name: "Emily", venue: "circular2" }],
    "10:00": [{ name: "Mike", venue: "icenter" }],
    "14:00": [{ name: "Anna", venue: "circular2" }],
    "16:00": [{ name: "John", venue: "icenter" }],
  },
};

const timeBlocks = [
  { label: "08:00 AM - 12:00 PM", start: 8, end: 12 },
  { label: "12:00 PM - 04:00 PM", start: 12, end: 16 },
  { label: "04:00 PM - 10:00 PM", start: 16, end: 22 },
];

const WeeklySchedule = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Get first person in the time block for a day
  const getPersonForDayBlock = (day, startHour, endHour) => {
    if (!timetable[day]) return "";
    let persons = [];
    for (const time in timetable[day]) {
      const hour = parseInt(time.split(":")[0], 10);
      if (hour >= startHour && hour < endHour) {
        timetable[day][time].forEach(({ name, venue }) => {
          const personStr = `${name} - ${venue}`;
          if (!persons.includes(personStr)) persons.push(personStr);
        });
      }
    }
    return persons[0] || "";
  };

  // Fallback names if last row is empty (optional)
  const fallbackNames = [
    "Tom - icenter",
    "Emily - circular2",
    "Anna - icenter",
    "Mike - circular2",
    "John - icenter",
    "Jane - circular2",
  ];

  return (
    <div className="schedule-wrapper">
      <h2>Weekly Schedule Timetable</h2>
      <div className="schedule-container">
        <div className="schedule-grid">
          {/* Header Row */}
          <div className="grid-header">
            <div className="cell time-header">Time Block</div>
            {days.map((day) => (
              <div className="cell day-header" key={day}>
                {day}
              </div>
            ))}
          </div>

          {/* Time Block Rows */}
          {timeBlocks.map(({ label, start, end }, blockIndex) => (
            <div className="grid-row" key={label}>
              <div className="cell time">{label}</div>

              {days.map((day, i) => {
                let content = getPersonForDayBlock(day, start, end);

                if (blockIndex === timeBlocks.length - 1 && !content) {
                  content = fallbackNames[i % fallbackNames.length];
                }

                return (
                  <div className="cell" key={day}>
                    {content}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
