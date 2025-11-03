import React, { useState } from "react";
import "../styles/GenerateReport.scss";
import { Calendar, Clock, CheckCircle, FileText, Users } from "lucide-react";

function GenerateReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const summaryStats = [
    {
      label: "Total Hours",
      value: "888",
      description: "Across all assistants",
      icon: <Clock size={18} />,
    },
    {
      label: "Total Shifts",
      value: "111",
      description: "Completed this month",
      icon: <CheckCircle size={18} />,
    },
    {
      label: "Leave Days",
      value: "9",
      description: "Total days off taken",
      icon: <FileText size={18} />,
    },
    {
      label: "Avg Coverage",
      value: "94.5%",
      description: "Monthly average",
      icon: <Users size={18} />,
      isCoverage: true,
    },
  ];

  const performanceData = [
    {
      name: "John Doe",
      hours: "160h",
      shifts: 20,
      leaves: 2,
      exchanges: 1,
      avg: "8.0h",
    },
    {
      name: "Jane Smith",
      hours: "152h",
      shifts: 19,
      leaves: 1,
      exchanges: 0,
      avg: "8.0h",
    },
    {
      name: "Mike Johnson",
      hours: "144h",
      shifts: 18,
      leaves: 3,
      exchanges: 2,
      avg: "8.0h",
    },
  ];

  const generateCSV = () => {
    let csv = "Student Name,Total Hours,Number of Shifts,Leave Days,Shift Exchanges,Avg Hours/Shift\n";
    performanceData.forEach((entry) => {
      csv += `${entry.name},${entry.hours},${entry.shifts},${entry.leaves},${entry.exchanges},${entry.avg}\n`;
    });
    return csv;
  };

  const handleDownload = () => {
    const csvData = generateCSV();
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const start = startDate || "Start";
    const end = endDate || "End";
    a.download = `Report_${start}_to_${end}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="monthly-report-page">
      <div className="report-header">
        <div>
          <h1>Generate Report</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        {summaryStats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="label">
              {stat.label} {stat.icon}
            </div>
            <div className="value">{stat.value}</div>
            <div className={`description ${stat.isCoverage ? "green" : ""}`}>
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Section */}
      <div className="performance-section">
        <h2>Individual Performance</h2>
        <p>Detailed breakdown by student assistant</p>

        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Total Hours</th>
              <th>Number of Shifts</th>
              <th>Leave Days</th>
              <th>Shift Exchanges</th>
              <th>Avg Hours/Shift</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((entry, index) => (
              <tr key={index}>
                <td><strong>{entry.name}</strong></td>
                <td>{entry.hours}</td>
                <td>{entry.shifts}</td>
                <td>{entry.leaves}</td>
                <td>{entry.exchanges}</td>
                <td>{entry.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🔽 Dates below the table */}
        <div className="date-range">
          <div className="date-input">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </div>

        {/* 📥 Download Button */}
        <div className="download-section">
          <button className="download-btn" onClick={handleDownload}>
            ⬇ Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateReport;