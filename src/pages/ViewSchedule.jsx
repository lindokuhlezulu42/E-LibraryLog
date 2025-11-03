import React, { useState, useEffect } from "react";
import "../styles/ViewSchedule.scss";

const ViewSchedule = () => {
  // Days and Times used for both static and editable tables
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00"];

  // --- Editable Timetable State (5x4 grid) ---
  const [timetable, setTimetable] = useState(
    Array(days.length)
      .fill()
      .map(() => Array(times.length).fill(""))
  );

  const [selectedFile, setSelectedFile] = useState(null);

  // --- Load saved timetable from localStorage (if exists) ---
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("editableTimetable"));
    if (saved) setTimetable(saved);
  }, []);

  // --- Persist timetable changes to localStorage ---
  useEffect(() => {
    localStorage.setItem("editableTimetable", JSON.stringify(timetable));
  }, [timetable]);

  // --- Hardcoded Student Assistants' Schedules ---
  const studentAssistants = [
    {
      name: "Alice Johnson",
      schedule: [
        ["Lab Support", "Office Hours", "", "Tutoring"],
        ["Office Hours", "Lab Support", "", " "],
        ["Study Group", "", "Lab Support", "Office Hours"],
        ["", "Study Group", "", "Lab Support"],
        ["", "Tutoring", "Study Group", "Office Hours"],
      ],
    },
    {
      name: "Ben Carter",
      schedule: [
        ["Tutoring", "Lab Support", "Office Hours", "Study Group"],
        ["", "Tutoring", "", "Office Hours"],
        ["Office Hours", "Study Group", "", "Lab Support"],
        ["Lab Support", "", "Study Group", "Tutoring"],
        ["Tutoring", "Study Group", "", ""],
      ],
    },
    {
      name: "Cara Lee",
      schedule: [
        ["Study Group", "", "", "Office Hours"],
        ["", "Study Group", "Tutoring", ""],
        ["Tutoring", "Office Hours", "", "Lab Support"],
        ["", "Lab Support", "", "Study Group"],
        ["Study Group", "Office Hours", "", "Tutoring"],
      ],
    },
  ];

  // --- Handle cell input change in editable table ---
  const handleCellChange = (dayIndex, timeIndex, value) => {
    const updated = [...timetable];
    updated[dayIndex][timeIndex] = value;
    setTimetable(updated);
  };

  // --- Save button handler ---
  const handleSave = () => {
    localStorage.setItem("editableTimetable", JSON.stringify(timetable));
    alert("Timetable saved successfully!");
  };

  // --- Download CSV file of timetable ---
  const handleDownload = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Day / Time," + times.join(",") + "\n";

    timetable.forEach((row, i) => {
      const rowData = [days[i], ...row].join(",");
      csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Student_Assistant_Timetable.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Handle CSV file selection ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // --- Upload CSV and update timetable ---
  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result.trim();
        const rows = text.split("\n");
        const headers = rows[0].split(",");

        // Validate header and rows
        if (headers.length - 1 !== times.length) {
          alert("Invalid CSV format. Please check your column count.");
          return;
        }

        const newTimetable = rows.slice(1).map((row) => row.split(",").slice(1));

        if (newTimetable.length !== days.length) {
          alert("Invalid CSV format. Please check the number of rows.");
          return;
        }

        setTimetable(newTimetable);

        // Create new notification
        const newNotification = {
          id: Date.now(),
          title: "New Timetable Uploaded",
          message:
            "A new student assistant timetable has been uploaded. Please review it in your schedule.",
          timestamp: new Date().toLocaleString(),
          read: false,
        };

        const existingNotifications =
          JSON.parse(localStorage.getItem("studentNotifications")) || [];
        localStorage.setItem(
          "studentNotifications",
          JSON.stringify([newNotification, ...existingNotifications])
        );

        alert("Timetable uploaded successfully! Students have been notified.");
      } catch (error) {
        console.error("Error reading CSV:", error);
        alert("Failed to upload CSV. Please check the file format.");
      }
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div className="view-schedule">
      <h1>Student Assistants' Timetable</h1>

      {/* --- All Student Assistants' Static Timetables --- */}
      <div className="all-timetables-view">
        <div className="timetable-list">
          {studentAssistants.map((assistant, index) => (
            <div key={index} className="assistant-timetable-card">
              <h3>{assistant.name}'s Timetable</h3>
              <div className="timetable-grid">
                <table>
                  <thead>
                    <tr>
                      <th>Day / Time</th>
                      {times.map((time, i) => (
                        <th key={i}>{time}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, dayIndex) => (
                      <tr key={dayIndex}>
                        <td className="day">{day}</td>
                        {times.map((_, timeIndex) => (
                          <td key={timeIndex}>
                            {assistant.schedule[dayIndex][timeIndex]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Editable Timetable Section --- */}
      <div className="schedule-draft">
        <h2>Editable Timetable</h2>
        <div className="timetable-grid">
          <table>
            <thead>
              <tr>
                <th>Day / Time</th>
                {times.map((time, i) => (
                  <th key={i}>{time}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIndex) => (
                <tr key={dayIndex}>
                  <td className="day">{day}</td>
                  {times.map((_, timeIndex) => (
                    <td key={timeIndex}>
                      <input
                        type="text"
                        value={timetable[dayIndex][timeIndex]}
                        placeholder="Enter activity"
                        onChange={(e) =>
                          handleCellChange(dayIndex, timeIndex, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="draft-actions">
          <button className="secondary-btn" onClick={handleSave}>
            Save Draft
          </button>
          <button className="download-btn" onClick={handleDownload}>
            Download Timetable
          </button>
        </div>
      </div>

      {/* --- Upload CSV Section --- */}
      <div className="upload-section">
        <h2>Upload Final Schedule</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button className="upload-btn" onClick={handleUpload}>
          Upload
        </button>
      </div>
    </div>
  );
};

export default ViewSchedule;
