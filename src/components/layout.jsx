import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // your student sidebar component
import "../styles/layout.scss";

function Layout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="content">
        {/* This is where the routed pages (Dashboard, ReportInOut, etc.) will appear */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
