import { useState } from "react";

const moduleData = {
  moduleNumber: 1,
  duration: "5 weeks",
  title: "Data Engineering",
  attendance: 0,
  modulePSP: 0,
  days: [
    { id: 1, date: "18 MAY", calDay: 18, calMonth: 4, calYear: 2026, label: "DAY 1", topic: "Data Engineering 101", lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 2, date: "20 MAY", calDay: 20, calMonth: 4, calYear: 2026, label: "DAY 2", topic: "Introduction to Data Engineering", lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 3, date: "22 MAY", calDay: 22, calMonth: 4, calYear: 2026, label: "DAY 3", topic: "Writing Efficient Queries: Part 1", lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 4, date: "24 MAY", calDay: 24, calMonth: 4, calYear: 2026, label: "DAY 4", topic: "Writing Efficient Queries: Part 2", lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 5, date: "26 MAY", calDay: 26, calMonth: 4, calYear: 2026, label: "DAY 5", topic: "Intro to Hadoop", lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 6, date: "28 MAY", calDay: 28, calMonth: 4, calYear: 2026, label: "DAY 6", topic: "HDFS and MAP-REDUCE", lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 7, date: "30 MAY", calDay: 30, calMonth: 4, calYear: 2026, label: "DAY 7", topic: "Introduction to Hive", lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 8, date: "1 JUN", calDay: 1, calMonth: 5, calYear: 2026, label: "DAY 8", topic: "Advanced features of Hive", lecture: 100, assignment: { done: 0, total: 10 } },
  ],
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({ onDateClick }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const moduleDayMap = {};
  moduleData.days.forEach((d, i) => {
    if (d.calMonth === month && d.calYear === year) {
      moduleDayMap[d.calDay] = i;
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 18 }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 18, color: "#1f2937" }}>{monthName} {year}</span>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 18 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#9ca3af", padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((day, i) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isModuleDay = day !== null && moduleDayMap[day] !== undefined;
          return (
            <div key={i} onClick={() => isModuleDay && onDateClick(moduleDayMap[day])}
              style={{
                textAlign: "center", padding: "10px 4px", borderRadius: 10, fontSize: 14,
                fontWeight: isToday || isModuleDay ? 700 : 400,
                background: isToday ? "linear-gradient(135deg, #f97316, #ec4899)" : isModuleDay ? "#fff7ed" : "transparent",
                color: isToday ? "#fff" : isModuleDay ? "#f97316" : day ? "#374151" : "transparent",
                cursor: isModuleDay ? "pointer" : "default",
                border: isModuleDay && !isToday ? "2px solid #f97316" : "2px solid transparent",
              }}>{day || ""}</div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: "#fff7ed", border: "2px solid #f97316" }}></div>
        <span style={{ fontSize: 12, color: "#6b7280" }}>Module class day — click to view</span>
      </div>
    </div>
  );
}

export default function App() {
  const [expanded, setExpanded] = useState(false);
  const [highlightedDay, setHighlightedDay] = useState(null);

  const handleDateClick = (dayIndex) => {
    setExpanded(true);
    setHighlightedDay(dayIndex);
    setTimeout(() => {
      document.getElementById(`day-${dayIndex}`)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "32px 24px", fontFamily: "Segoe UI, sans-serif" }}>

      <h1 style={{ textAlign: "center", color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 32 }}>
        📚 Course Dashboard
      </h1>

      <div style={{ display: "flex", gap: 28, maxWidth: 1200, margin: "0 auto", alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Left - Calendar */}
        <div style={{ flex: "1 1 380px" }}>
          <Calendar onDateClick={handleDateClick} />
        </div>

        {/* Right - Module */}
        <div style={{ flex: "1 1 380px" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

            {/* Module Header */}
            <div onClick={() => setExpanded(!expanded)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "16px 20px", background: "linear-gradient(90deg, #f97316, #ec4899)", borderRadius: 14, marginBottom: expanded ? 16 : 0 }}>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>MODULE {moduleData.moduleNumber} • {moduleData.duration}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{moduleData.title}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 14px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{moduleData.attendance}%</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>Attendance</div>
                </div>
                <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 14px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{moduleData.modulePSP}%</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>PSP</div>
                </div>
                <span style={{ color: "#fff", fontSize: 22 }}>{expanded ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Topics */}
            {expanded && (
              <div style={{ marginTop: 8 }}>
                {moduleData.days.map((day, index) => (
                  <div id={`day-${index}`} key={day.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 10, marginBottom: 6,
                    background: highlightedDay === index ? "#fff7ed" : "#fafafa",
                    border: highlightedDay === index ? "2px solid #f97316" : "2px solid transparent",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "#f97316", borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" }}>{day.label}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{day.date}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937", flex: 1 }}>{day.topic}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", whiteSpace: "nowrap" }}>Lecture: {day.lecture}%</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}