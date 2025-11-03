// ✅ src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts
import Layout from "./components/layout";
import AdminLayout from "./components/AdminLayout";

// Contexts
import { ReportProvider } from "./context/ReportContext";
import { ShiftExchangeProvider } from "./context/ShiftExchangeContext";

// Pages (Student)
import StudentDashboard from "./pages/StudentDashboard";
import UploadTimetable from "./pages/UploadTimetable";
import ShiftExchange from "./pages/ShiftExchange";
import LeaveRequest from "./pages/LeaveRequest";
import ReportInOut from "./pages/ReportInOut";
import MySchedule from "./pages/MySchedule";
import ReportDisruption from "./pages/ReportDisruption";
import StudentNotifications from "./pages/StudentNotifications";
 

// Pages (Admin)
import AdminDashboard from "./pages/AdminDashboard";

import ViewLeave from "./pages/ViewLeave";
import ViewShiftExchange from "./pages/ViewShiftExchange";

import ViewSchedule from "./pages/ViewSchedule";
import MonthlyReport from "./pages/MonthlyReport";
import NotificationPage from "./pages/NotificationPage";
import StudentAssistantHours from "./pages/StudentAssistantHours";
import AdminManageStudentAssistant from "./pages/AdminManageStudentAssistant";
 
// Auth
import Login from "./pages/Login";
import GenerateReport from "./pages/GenerateReport";
import Welcome from "./pages/Welcome";
import UploadProofPage from "./pages/UploadProofPage";
import WeeklySchedule from "./pages/WeeklySchedule";

function App() {
  return (
    <ReportProvider>
      <ShiftExchangeProvider>
        <Router>
          <Routes>
            {/* 🔐 Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />

            {/* 🧑‍💼 Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/view-schedules"
              element={
                <AdminLayout>
                  <ViewSchedule />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/view-leaves"
              element={
                <AdminLayout>
                  <ViewLeave />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/view-shift-exchanges"
              element={
                <AdminLayout>
                  <ViewShiftExchange />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/students"
              element={
                <AdminLayout>
                  <AdminManageStudentAssistant />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/disruption"
              element={
                <AdminLayout>
                  <ReportDisruption />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/student-assistant-hours"
              element={
                <AdminLayout>
                  <StudentAssistantHours />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminLayout>
                  <NotificationPage />
                </AdminLayout>
              }
            />
             <Route
              path="/admin/generate-report"
              element={
                <AdminLayout>
                  <GenerateReport />
                </AdminLayout>
              }
            />

          
          
        <Route
  path="/admin/manage-student-assistants"
  element={
    <AdminLayout>
      <AdminManageStudentAssistant />
    </AdminLayout>
  }
          />
            {/* 🎓 Student Routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/upload-timetable" element={<UploadTimetable />} />
              <Route path="/shift-exchange" element={<ShiftExchange />} />
              <Route path="/leave" element={<LeaveRequest />} />
              <Route path="/report" element={<ReportInOut />} />
              <Route path="/schedule" element={<MySchedule />} />
              <Route path="/disruption-report" element={<ReportDisruption />} />
              <Route
              path="/student-notifications"
              element={<StudentNotifications />}
            />
             <Route
              path="/upload-proof-page"
              element={<UploadProofPage />}
            />
            </Route>

            <Route path="/weekly-schedule" element={<WeeklySchedule />} />
            
            {/* 📊 Standalone Report */}
            <Route path="/monthly-report" element={<MonthlyReport />} />

            {/* ❓ 404 Fallback */}
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </Router>
      </ShiftExchangeProvider>
    </ReportProvider>
  );
}

export default App;
