// src/pages/MySchedule.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MySchedule.scss";
 // Keep using the same SCSS unless you rename it too

const SAMPLE_SHIFTS = [
  { id: 1, date: "2025-10-05", start: "14:00", end: "18:00", title: "Library", location: "Library" },
  { id: 2, date: "2025-10-10", start: "09:00", end: "12:00", title: "Front Desk", location: "Admin Foyer" },
  { id: 3, date: "2025-10-15", start: "08:00", end: "12:00", title: "Mathematics Tutorial", location: "Room 201" },
  { id: 4, date: "2025-10-22", start: "13:00", end: "16:00", title: "Lab Assistant", location: "Lab 3" },
  { id: 5, date: "2025-10-28", start: "10:00", end: "12:00", title: "Help Desk", location: "IT Hub" },
];

const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${pad(m)} ${suffix}`;
}

const MySchedule = () => {
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedISO, setSelectedISO] = useState(toISO(today));
  const navigate = useNavigate();
  const itemRefs = useRef({});

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const firstWeekday = monthStart.getDay();

  const gridDates = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [firstWeekday, daysInMonth, year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    SAMPLE_SHIFTS.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date).push(s);
    });
    return map;
  }, []);

  const monthLabel = `${monthCursor.toLocaleString("default", { month: "long" })} ${year}`;

  const monthShifts = useMemo(
    () =>
      SAMPLE_SHIFTS
        .filter((s) => {
          const [yy, mm] = s.date.split("-").map(Number);
          return yy === year && mm === month + 1;
        })
        .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)),
    [year, month]
  );

  const goPrev = () => setMonthCursor(new Date(year, month - 1, 1));
  const goNext = () => setMonthCursor(new Date(year, month + 1, 1));

  useEffect(() => {
    const el = itemRefs.current[selectedISO];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedISO, monthShifts.length]);

  const goToWeeklyReport = () => {
    navigate("/weekly-schedule");
  };

  return (
    <div className="ms-container">
      <main className="ms-content">
        <div className="schedule-page">
          {/* Page header */}
          <div className="page-head">
            <button className="back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
            <h2>My Schedule</h2> {/* ✅ Updated heading */}
            <span className="ghost" />
          </div>

          {/* Calendar */}
          <div className="calendar-card">
            <div className="month-row">
              <button className="nav" onClick={goPrev} aria-label="Previous month">‹</button>
              <div className="month-title">{monthLabel}</div>
              <button className="nav" onClick={goNext} aria-label="Next month">›</button>
            </div>

            <div className="weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="w">{d}</div>
              ))}
            </div>

            <div className="grid">
              {gridDates.map((dateObj, i) => {
                if (!dateObj) return <div key={`b-${i}`} className="cell blank" />;
                const iso = toISO(dateObj);
                const inThisMonth = dateObj.getMonth() === month;
                const isSelected = iso === selectedISO;
                const isToday = iso === toISO(today);
                const hasEvents = eventsByDay.has(iso);

                return (
                  <button
                    key={iso}
                    className={[
                      "cell",
                      inThisMonth ? "" : "muted",
                      isSelected ? "selected" : "",
                      isToday ? "today" : "",
                    ].join(" ").trim()}
                    onClick={() => setSelectedISO(iso)}
                    aria-label={`Day ${dateObj.getDate()}`}
                  >
                    <span className="num">{dateObj.getDate()}</span>
                    {hasEvents && <span className="dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          <div className="list-card" id="month-list">
            <h3>All Shifts This Month</h3>

            {monthShifts.length === 0 ? (
              <div className="empty">No shifts scheduled this month.</div>
            ) : (
              <ul className="shift-list">
                {monthShifts.map((s) => (
                  <li
                    key={s.id}
                    id={s.date}
                    ref={(el) => { if (el) itemRefs.current[s.date] = el; }}
                    className={s.date === selectedISO ? "is-selected" : ""}
                  >
                    <div className="date">
                      {new Date(s.date).toLocaleDateString(undefined, {
                        weekday: "short", month: "short", day: "numeric"
                      })}
                    </div>
                    <div className="meta">
                      <div className="time">🕑 {to12h(s.start)} — {to12h(s.end)}</div>
                      <div className="where">📍 {s.location}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Weekly Schedule Button */}
          <div className="weekly-schedule-container">
            <button onClick={goToWeeklyReport} type="button" aria-label="Go to Weekly Schedule">
              Weekly Schedule
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MySchedule;
