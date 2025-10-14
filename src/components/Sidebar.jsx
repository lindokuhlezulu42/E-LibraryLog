import React, { useState } from "react";
import "../styles/Sidebar.scss";
import { Link, useLocation } from "react-router-dom";
import LayoutDashboard from "./icons/LayoutDashboard";
import { FileText, ArrowLeftRight, Calendar, Upload,ToggleRight,ToggleLeft,History } from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
    { name: "Report In/Out", path: "/report", icon: <History /> },
    { name: "My Schedule", path: "/schedule", icon: <Calendar size={24} /> },
    { name: "Leave Request", path: "/leave", icon: <FileText size={24} /> },
    { name: "Shift Exchange", path: "/shift-exchange", icon: <ArrowLeftRight size={24} /> },
    { name: "Upload Timetable", path: "/upload-timetable", icon: <Upload size={24} /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="header">
        {isOpen && <h2>Student Portal</h2>}
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ToggleLeft />: <ToggleRight />}
        </button>
      </div>

      <div className="menu-section">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`menu-item ${
                location.pathname === item.path ||
                (location.pathname === "/" && item.path === "/dashboard")
                  ? "active"
                  : ""
              }`}
            >
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                {isOpen && <span className="label">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isOpen && (
        <div className="sidebar-footer">
          <button className="logout-btn">
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out-icon">
                <path d="m16 17 5-5-5-5"/>
                <path d="M21 12H9"/>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              </svg>
            </span>
            <span className="label">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
