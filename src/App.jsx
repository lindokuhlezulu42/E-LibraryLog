// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import AdminLayout from "./components/AdminLayout"; // ✅ Added import

// Pages
import StudentDashboard from "./pages/StudentDashboard";
import UploadTimetable from "./pages/UploadTimetable";
import ShiftExchange from "./pages/ShiftExchange";
import LeaveRequest from "./pages/LeaveRequest";
import ReportInOut from "./pages/ReportInOut";
import MySchedule from "./pages/MySchedule";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import ViewLeave from "./pages/ViewLeave";
import ViewShiftExchange from "./pages/ViewShiftExchange";
import AddStudentAssistant from "./pages/AddStudentAssistant";
import ViewSchedule from "./pages/ViewSchedule";
import MonthlyReport from "./pages/MonthlyReport";
import ReportDisruption from "./pages/ReportDisruption";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔐 Public / Login Routes */}
        <Route path="/" element={<Login />} />
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
              <AddStudentAssistant />
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

        {/* 🎓 Student Routes (wrapped in Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/upload-timetable" element={<UploadTimetable />} />
          <Route path="/shift-exchange" element={<ShiftExchange />} />
          <Route path="/leave" element={<LeaveRequest />} />
          <Route path="/report" element={<ReportInOut />} />
          <Route path="/schedule" element={<MySchedule />} />
        </Route>

        {/* 📊 Standalone Report Route (not in student layout) */}
        <Route path="/Monthly-report" element={<MonthlyReport />} />

        {/* ❓ 404 Fallback */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;