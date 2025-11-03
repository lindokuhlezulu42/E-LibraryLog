//ShiftExchange.jsx
import React, { useState } from "react";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import "../styles/ShiftExchange.scss";

/* ===========================
   NOTIFICATION HELPERS
   =========================== */
const addAdminNotification = (message) => {
  const item = {
    id: Date.now(),
    type: "shift-exchange",          // useful for filtering on the admin page
    message,
    timestamp: new Date().toLocaleString(),
    read: false,
  };
  const list = JSON.parse(localStorage.getItem("adminNotifications")) || [];
  localStorage.setItem("adminNotifications", JSON.stringify([item, ...list]));
};

const addStudentNotification = (target, message) => {
  // `target` can be an email, user id, or display name (mock for now)
  const item = {
    id: Date.now(),
    to: target,
    type: "shift-exchange",
    subject: "Shift Exchange",
    message,
    timestamp: new Date().toLocaleString(),
    read: false,
  };
  const list = JSON.parse(localStorage.getItem("studentNotifications")) || [];
  localStorage.setItem("studentNotifications", JSON.stringify([item, ...list]));
};

const getCurrentStudentName = () => {
  // replace with your auth user (e.g., from context/JWT)
  const saved = JSON.parse(localStorage.getItem("currentUser"));
  return saved?.name || "You";
};

export default function ShiftExchange() {
  // tabs
  const [activeTab, setActiveTab] = useState("send"); // 'send' | 'received'

  // form state
  const [selectedYourShift, setSelectedYourShift] = useState("");
  const [selectedColleagueShift, setSelectedColleagueShift] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  // --- mock data (replace with API later) ---
  const yourShifts = [
    { id: "y1", date: "2025-10-13", time: "08:00 AM – 12:00 PM", location: "Icenter 1" },
    { id: "y2", date: "2025-10-15", time: "08:00 AM – 12:00 PM", location: "Icenter 3" },
    { id: "y3", date: "2025-10-17", time: "08:00 AM – 12:00 PM", location: "Icenter 1" },
    { id: "y4", date: "2025-10-20", time: "04:00 PM – 08:00 PM", location: "Library Building" },
  ];

  const colleagueShifts = [
    { id: "c1", who: "Charlie", date: "2025-10-14", time: "08:00 AM – 12:00 PM", location: "Icenter 2" },
    { id: "c2", who: "Alice",   date: "2025-10-15", time: "12:00 PM – 04:00 PM", location: "Icenter 3" },
    { id: "c3", who: "Bob",     date: "2025-10-17", time: "04:00 PM – 10:00 PM", location: "Icenter 1" },
  ];

  const [sentRequests, setSentRequests] = useState([
    {
      id: "s1",
      with: "Charlie",
      status: "Pending",
      their: { date: "2025-10-14", time: "08:00 AM – 12:00 PM", location: "Icenter 2" },
      yours: { date: "2025-10-13", time: "08:00 AM – 12:00 PM", location: "Icenter 1" },
      message: "sick",
    },
  ]);

  const [receivedRequests, setReceivedRequests] = useState([
    {
      id: "r1",
      from: "Alice",
      status: "Pending",
      theirShift: { date: "2025-10-15", time: "12:00 PM – 04:00 PM", location: "Icenter 3" },
      yourShift:  { date: "2025-10-15", time: "08:00 AM – 12:00 PM", location: "Icenter 3" },
      message: "Can we swap because of a doctor appointment?",
    },
    {
      id: "r2",
      from: "Bob",
      status: "Accepted",
      theirShift: { date: "2025-10-17", time: "04:00 PM – 10:00 PM", location: "Icenter 1" },
      yourShift:  { date: "2025-10-17", time: "08:00 AM – 12:00 PM", location: "Icenter 1" },
      message: "",
    },
  ]);

  // --- share with everyone ---
  const [shareShiftId, setShareShiftId] = useState("y1");
  const [sharedShifts, setSharedShifts] = useState([
    { id: "sh1", date: "2025-10-13", time: "08:00 AM – 12:00 PM", location: "Icenter 1", who: "You" },
  ]);
  const [postedShifts] = useState([
    { id: "p1", date: "2025-10-14", time: "12:00 PM – 04:00 PM", location: "Icenter 2", who: "Alice" },
    { id: "p2", date: "2025-10-15", time: "04:00 PM – 10:00 PM", location: "Icenter 3", who: "Bob" },
  ]);

  /* ===========================
     ACTIONS
     =========================== */
  function handleSendRequest(e) {
    e.preventDefault();
    if (!selectedYourShift || !selectedColleagueShift) {
      setStatus("❌ Please select both your shift and a colleague shift.");
      return;
    }

    const y = yourShifts.find((s) => s.id === selectedYourShift);
    const c = colleagueShifts.find((s) => s.id === selectedColleagueShift);

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);

      // Save to SENT list
      setSentRequests((prev) => [
        {
          id: `s-${Date.now()}`,
          with: c.who,
          status: "Pending",
          their: { date: c.date, time: c.time, location: c.location },
          yours: { date: y.date, time: y.time, location: y.location },
          message,
        },
        ...prev,
      ]);

      // === NEW: Notifications ===
      const whoSent = getCurrentStudentName();
      addAdminNotification(
        `${whoSent} sent a shift exchange request to ${c.who} | Your: ${y.date} ${y.time} (${y.location}) ⇄ Their: ${c.date} ${c.time} (${c.location})`
      );
      // (Optional) notify the colleague (student inbox)
      addStudentNotification(
        c.who,
        `${whoSent} requested to exchange shifts with you. Their shift: ${y.date} ${y.time} (${y.location}).`
      );

      setStatus("✅ Shift exchange request sent successfully!");
      setSelectedYourShift("");
      setSelectedColleagueShift("");
      setMessage("");
    }, 900);
  }

  function handleApproveRequest(id) {
    setReceivedRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Accepted" } : r))
    );

    const who = getCurrentStudentName();
    const r = receivedRequests.find((x) => x.id === id);
    if (r) {
      addAdminNotification(
        `${who} ACCEPTED a shift exchange from ${r.from} | Their: ${r.theirShift.date} ${r.theirShift.time} (${r.theirShift.location}) ⇄ Your: ${r.yourShift.date} ${r.yourShift.time} (${r.yourShift.location})`
      );
      addStudentNotification(
        r.from,
        `Your shift exchange request to ${who} was ACCEPTED.`
      );
    }
    setStatus("✅ Shift exchange request approved!");
  }

  function handleRejectRequest(id) {
    setReceivedRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );

    const who = getCurrentStudentName();
    const r = receivedRequests.find((x) => x.id === id);
    if (r) {
      addAdminNotification(
        `${who} REJECTED a shift exchange from ${r.from} | Their: ${r.theirShift.date} ${r.theirShift.time} (${r.theirShift.location}) ⇄ Your: ${r.yourShift.date} ${r.yourShift.time} (${r.yourShift.location})`
      );
      addStudentNotification(
        r.from,
        `Your shift exchange request to ${who} was REJECTED.`
      );
    }
    setStatus("❌ Shift exchange request rejected.");
  }

  function handleShare(e) {
    e.preventDefault();
    const y = yourShifts.find((s) => s.id === shareShiftId);
    if (!y) return;

    setSharedShifts((prev) => [
      { id: `sh-${Date.now()}`, date: y.date, time: y.time, location: y.location, who: "You" },
      ...prev,
    ]);

    // === NEW: notify admin (shared to ALL)
    const who = getCurrentStudentName();
    addAdminNotification(`${who} shared a shift with everyone: ${y.date} ${y.time} (${y.location})`);

    setStatus("✅ Shift shared with everyone.");
  }

  return (
    <div className="shiftx-shell">
      {/* header (matches schedule spacing) */}
      <div className="shiftx-head">
        <button className="back" onClick={() => window.history.back()} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <h2>Shift Exchange</h2>
        <span className="ghost" />
      </div>

      {/* tabs */}
      <div className="shiftx-tabs">
        <button
          className={`tab ${activeTab === "send" ? "active" : ""}`}
          onClick={() => setActiveTab("send")}
        >
          Send Request
        </button>
        <button
          className={`tab ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received Requests
        </button>
      </div>

      {/* SEND side (form + share + lists + sent) */}
      {activeTab === "send" && (
        <>
          <section className="card send-card">
            <h3>Shift Exchange Request</h3>

            <form className="form" onSubmit={handleSendRequest}>
              <div className="field">
                <label>Your Shift</label>
                <select
                  value={selectedYourShift}
                  onChange={(e) => setSelectedYourShift(e.target.value)}
                  required
                >
                  <option value="">Select your shift</option>
                  {yourShifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.date} • {s.time} • {s.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Colleague’s Available Shifts</label>
                <select
                  value={selectedColleagueShift}
                  onChange={(e) => setSelectedColleagueShift(e.target.value)}
                  required
                >
                  <option value="">Select colleague shift</option>
                  {colleagueShifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.who}: {s.date} • {s.time} • {s.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Reason to swap…"
                  rows={3}
                />
              </div>

              <button type="submit" className="primary" disabled={isSending}>
                {isSending ? "Sending…" : "SEND EXCHANGE REQUEST"}
              </button>
            </form>
          </section>

          {/* Share with Everyone */}
          <section className="card share-card">
            <h3>Share With Everyone</h3>
            <form className="share-form" onSubmit={handleShare}>
              <select
                value={shareShiftId}
                onChange={(e) => setShareShiftId(e.target.value)}
              >
                {yourShifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} • {s.time} • {s.location}
                  </option>
                ))}
              </select>
              <button className="share-btn" type="submit">SHARE</button>
            </form>
          </section>

          {/* Shared & Posted lists */}
          <section className="card simple-list">
            <h3>Shared Shifts</h3>
            {sharedShifts.length === 0 ? (
              <div className="empty">No shared shifts yet.</div>
            ) : (
              <ul className="items">
                {sharedShifts.map((it) => (
                  <li key={it.id} className="item">
                    <div className="lines">
                      <div><span className="dot">🗓️</span> Date: {it.date}</div>
                      <div><span className="dot">⏱️</span> Time: {it.time}</div>
                      <div><span className="dot">📍</span> Location: {it.location}</div>
                      <div><span className="dot">👤</span> Posted by: {it.who}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card simple-list">
            <h3>Posted Shifts</h3>
            {postedShifts.length === 0 ? (
              <div className="empty">No posted shifts found.</div>
            ) : (
              <ul className="items">
                {postedShifts.map((it) => (
                  <li key={it.id} className="item">
                    <div className="lines">
                      <div><span className="dot">🗓️</span> Date: {it.date}</div>
                      <div><span className="dot">⏱️</span> Time: {it.time}</div>
                      <div><span className="dot">📍</span> Location: {it.location}</div>
                      <div><span className="dot">👤</span> Posted by: {it.who}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Sent Shifts */}
          <section className="card sent-card">
            <h3>Sent Shifts</h3>
            {sentRequests.length === 0 ? (
              <div className="empty">No sent requests yet.</div>
            ) : (
              <div className="stack">
                {sentRequests.map((req) => (
                  <article key={req.id} className={`req ${req.status.toLowerCase()}`}>
                    <div className="row between">
                      <div className="from">
                        <strong>With:</strong> {req.with}
                      </div>
                      <span className={`badge ${req.status.toLowerCase()}`}>{req.status}</span>
                    </div>

                    <ul className="bullets">
                      <li><span>🗓️</span> <strong>Date:</strong> {req.their.date}</li>
                      <li><span>⏱️</span> <strong>Time:</strong> {req.their.time}</li>
                      <li><span>📍</span> <strong>Location:</strong> {req.their.location}</li>
                      <li><span>🔁</span> <strong>Your shift:</strong> {req.yours.date}</li>
                      <li><span>🕒</span> <strong>Your shift time:</strong> {req.yours.time}</li>
                      {req.message ? <li><span>💬</span> <strong>Message:</strong> {req.message}</li> : null}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* RECEIVED tab */}
      {activeTab === "received" && (
        <section className="card recv-card">
          <h3>Received Requests</h3>

          {receivedRequests.length === 0 ? (
            <div className="empty">No received shift exchange requests.</div>
          ) : (
            <div className="stack">
              {receivedRequests.map((r) => (
                <article key={r.id} className={`req ${r.status.toLowerCase()}`}>
                  <div className="row between">
                    <div className="from">
                      <span className="muted">From:</span> <strong>{r.from}</strong>
                    </div>
                    <span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span>
                  </div>

                  <div className="grid2">
                    <div>
                      <h4>Their Shift</h4>
                      <div className="line"><Clock size={16} /> {r.theirShift.date}</div>
                      <div className="line"><Clock size={16} /> {r.theirShift.time}</div>
                      <div className="line"><MapPin size={16} /> {r.theirShift.location}</div>
                    </div>
                    <div>
                      <h4>Your Shift</h4>
                      <div className="line"><Clock size={16} /> {r.yourShift.date}</div>
                      <div className="line"><Clock size={16} /> {r.yourShift.time}</div>
                      <div className="line"><MapPin size={16} /> {r.yourShift.location}</div>
                    </div>
                  </div>

                  {r.message ? <p className="msg">{r.message}</p> : null}

                  {r.status === "Pending" && (
                    <div className="row gap">
                      <button className="btn approve" type="button" onClick={() => handleApproveRequest(r.id)}>
                        APPROVE
                      </button>
                      <button className="btn reject" type="button" onClick={() => handleRejectRequest(r.id)}>
                        REJECT
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* status toast */}
      {status && (
        <div className={`toast ${status.startsWith("✅") ? "ok" : "err"}`}>{status}</div>
      )}
    </div>
  );
}