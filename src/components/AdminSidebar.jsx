import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  Home,
  ClipboardList,
  ArrowLeftRight,
  UserPlus,
  LogOut,
  AlertTriangle,
  CalendarCheck2,
  Users,
  Bell,
  Clock,
  FileText,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import "../styles/AdminSidebar.scss";

function AdminSidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <Home size={18} /> },
    { name: "Schedule", path: "/admin/view-schedules", icon: <ClipboardList size={18} /> },
    { name: "View Leaves", path: "/admin/view-leaves", icon: <CalendarCheck2 size={18} /> },
    { name: "Shift Exchange", path: "/admin/view-shift-exchanges", icon: <ArrowLeftRight size={18} /> },
    
    { name: "Report Disruption", path: "/admin/disruption", icon: <AlertTriangle size={18} /> },
    { name: "Manage Student Assistant", path: "/admin/manage-student-assistants", icon: <Users size={18} /> },
    { name: "Notifications", path: "/admin/notifications", icon: <Bell size={18} /> },
    { name: "Total Hours Worked", path: "/admin/student-assistant-hours", icon: <Clock size={18} /> },
    { name: "Generate Report", path: "/admin/generate-report", icon: <FileText size={18} /> },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      <div className="logo-section">
        <button
          className="toggle-btn"
          onClick={toggleSidebar}
          title={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? <ToggleLeft /> : <ToggleRight />}
        </button>
        {isOpen && (
          <div className="logo-text">
            <h2>Admin Dashboard</h2>
           
          </div>
        )}
      </div>

      <nav className="sidebar-menu">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                {item.icon}
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
