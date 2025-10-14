import React from "react";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  Home,
  ClipboardList,
  ArrowLeftRight,
  UserPlus,
  LogOut,
  AlertTriangle, // ✅ New icon for Report Disruption
} from "lucide-react";
import "../styles/AdminSidebar.scss";

function AdminSidebar({ isOpen }) {
  return (
    <aside className={`admin-sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      {/* Logo Section */}
      <div className="logo-section">
        <div className="logo-icon">
          <Calendar size={32} color="#fff" />
        </div>
        {isOpen && (
          <div className="logo-text">
            <h2>E-LibraryLog</h2>
            <p>Admin Dashboard</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        <ul>
          <li>
            <NavLink to="/admin" className="nav-link">
              <Home size={18} />
              {isOpen && <span>Dashboard</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/view-schedules" className="nav-link">
              <ClipboardList size={18} />
              {isOpen && <span>Schedule</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/view-shift-exchanges" className="nav-link">
              <ArrowLeftRight size={18} />
              {isOpen && <span>Shift Exchange</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="/admin/students" className="nav-link">
              <UserPlus size={18} />
              {isOpen && <span>Add Student Assistant</span>}
            </NavLink>
          </li>

          {/* ✅ New Report Disruption Section */}
          <li>
            <NavLink to="/admin/disruption" className="nav-link">
              <AlertTriangle size={18} />
              {isOpen && <span>Report Disruption</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="logout-section">
        <button className="logout-btn">
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
