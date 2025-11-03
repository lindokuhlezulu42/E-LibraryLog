// src/components/AdminLayout.jsx
import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import "../styles/AdminLayout.scss";

function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`admin-layout ${isSidebarOpen ? "" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <main className="admin-main">{children}</main>
    </div>
  );
}

export default AdminLayout;
