// src/pages/MonthlyReport.jsx
import React from "react";
import { Download } from "lucide-react";
import "../styles/MonthlyReport.scss";

function MonthlyReport() {
  // Mock data — replace with API call later
  const summary = {
    totalHours: 888,
    totalShifts: 111,
    leaveDays: 9,
    avgCoverage: "94.5%",
  };

  const students = [
    { name: "John Doe", totalHours: "160h", shifts: 20, leaveDays: 2, shiftExchanges: 1, avgHoursPerShift: "8.0h" },
    { name: "Jane Smith", totalHours: "152h", shifts: 19, leaveDays: 1, shiftExchanges: 0, avgHoursPerShift: "8.0h" },
    { name: "Mike Johnson", totalHours: "144h", shifts: 18, leaveDays: 3, shiftExchanges: 2, avgHoursPerShift: "8.0h" },
    { name: "Sarah Williams", totalHours: "168h", shifts: 21, leaveDays: 0, shiftExchanges: 1, avgHoursPerShift: "8.0h" },
    { name: "Tom Brown", totalHours: "136h", shifts: 17, leaveDays: 2, shiftExchanges: 0, avgHoursPerShift: "8.0h" },
    { name: "Emily Davis", totalHours: "128h", shifts: 16, leaveDays: 1, shiftExchanges: 1, avgHoursPerShift: "8.0h" },
  ];

  const handleDownload = () => {
    alert("✅ Report downloaded!");
    // TODO: Add actual download logic (PDF/Excel)
  };

  return (
    <div className="monthly-report-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly Report</h1>
          <p className="page-subtitle">
            <span>📅</span> January 2025
          </p>
        </div>
        <button className="download-btn" onClick={handleDownload}>
          <Download size={18} />
          Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="stat-card">
          <div className="card-header">
            <span>Total Hours</span>
            <span>⏱️</span>
          </div>
          <div className="card-value">{summary.totalHours}</div>
          <div className="card-subtext">Across all assistants</div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <span>Total Shifts</span>
            <span>✅</span>
          </div>
          <div className="card-value">{summary.totalShifts}</div>
          <div className="card-subtext">Completed this month</div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <span>Leave Days</span>
            <span>📄</span>
          </div>
          <div className="card-value">{summary.leaveDays}</div>
          <div className="card-subtext">Total days off taken</div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <span>Avg Coverage</span>
            <span>👥</span>
          </div>
          <div className="card-value">{summary.avgCoverage}</div>
          <div className="card-trend">Monthly average</div>
        </div>
      </div>

      {/* Individual Performance */}
      <section className="individual-performance">
        <h2 className="section-title">Individual Performance</h2>
        <p className="section-subtitle">Detailed breakdown by student assistant</p>

        <div className="performance-table-container">
          <table className="performance-table">
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
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.totalHours}</td>
                  <td>{student.shifts}</td>
                  <td>{student.leaveDays}</td>
                  <td>{student.shiftExchanges}</td>
                  <td>{student.avgHoursPerShift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Monthly Summary */}
      <section className="monthly-summary">
        <h2 className="section-title">Monthly Summary</h2>
        <p className="section-subtitle">Key highlights and observations</p>

        <ul className="summary-list">
          <li>Overall attendance was excellent with an average coverage rate of 94.5%</li>
          <li>Sarah Williams had the highest contribution with 168 hours and perfect attendance</li>
          <li>9 total leave days were approved across all assistants</li>
          <li>5 shift exchange requests were processed successfully</li>
        </ul>
      </section>
    </div>
  );
}

export default MonthlyReport;