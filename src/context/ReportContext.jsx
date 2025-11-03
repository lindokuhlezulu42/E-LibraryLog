// src/context/ReportContext.jsx
import React, { createContext, useState } from "react";

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  // 🧪 Mock data (pretend this came from a backend)
  const mockReports = [
    {
      date: "2025-10-10",
      location: "Library Study Area",
      type: "Noise Disturbance",
      description: "Loud talking and music during quiet hours.",
    },
    {
      date: "2025-10-12",
      location: "Computer Lab 3",
      type: "Technical Issue",
      description: "Projector not turning on.",
    },
  ];

  const [reports, setReports] = useState(mockReports);

  const addReport = (report) => {
    setReports((prev) => [...prev, report]);
  };

  return (
    <ReportContext.Provider value={{ reports, addReport }}>
      {children}
    </ReportContext.Provider>
  );
};
