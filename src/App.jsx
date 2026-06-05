import { useState } from "react";

const classDates = [
  { calDay: 1,  calMonth: 5, calYear: 2026, label: "DAY 1" },
  { calDay: 2,  calMonth: 5, calYear: 2026, label: "DAY 2" },
  { calDay: 3,  calMonth: 5, calYear: 2026, label: "DAY 3" },
  { calDay: 4,  calMonth: 5, calYear: 2026, label: "DAY 4" },
  { calDay: 5,  calMonth: 5, calYear: 2026, label: "DAY 5" },
  { calDay: 6,  calMonth: 5, calYear: 2026, label: "DAY 6" },
  { calDay: 8,  calMonth: 5, calYear: 2026, label: "DAY 7" },
  { calDay: 9,  calMonth: 5, calYear: 2026, label: "DAY 8" },
];

function getDateLabel(calDay, calMonth) {
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${calDay} ${months[calMonth]}`;
}

const modulesData = [
  {
    moduleNumber: 1,
    duration: "5 weeks",
    title: "Data Engineering",
    attendance: 0,
    modulePSP: 0,
    timeSlot: "9:00 AM – 1:00 PM",
    color: { from: "#f97316", to: "#ec4899" },
    days: classDates.map((d, i) => ({
      id: i + 1,
      date: getDateLabel(d.calDay, d.calMonth),
      calDay: d.calDay, calMonth: d.calMonth, calYear: d.calYear,
      label: d.label,
      topic: ["Data Engineering 101","Introduction to Data Engineering","Writing Efficient Queries: Part 1","Writing Efficient Queries: Part 2","Intro to Hadoop","HDFS and MAP-REDUCE","Introduction to Hive","Advanced features of Hive"][i],
      lecture: 100,
      assignment: { done: 0, total: 10 },
    })),
  },
  {
    moduleNumber: 2,
    duration: "5 weeks",
    title: "Machine Learning",
    attendance: 0,
    modulePSP: 0,
    timeSlot: "1:30 PM – 5:30 PM",
    color: { from: "#10b981", to: "#0ea5e9" },
    days: classDates.map((d, i) => ({
      id: i + 1,
      date: getDateLabel(d.calDay, d.calMonth),
      calDay: d.calDay, calMonth: d.calMonth, calYear: d.calYear,
      label: d.label,
      topic: ["Introduction to ML","Supervised Learning","Linear Regression","Logistic Regression","Decision Trees","Random Forest","Model Evaluation","Feature Engineering"][i],
      lecture: 100,
      assignment: { done: 0, total: 10 },
    })),
  },
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function inRange(day, month, year) {
  const d = new Date(year, month, day);
  const start = new Date(2026, 5, 1);
  const end   = new Date(2026, 5, 9);
  return d >= start && d <= end;
}

function isSunday(day, month, year) {
  return new Date(year, month, day).getDay() === 0;
}

function isClassDay(day, month, year) {
  return inRange(day, month, year) && !isSunday(day, month, year);
}

function Calendar({ onDateClick, selectedDate }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 18, color: "#374151" }}>‹</button>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#1f2937" }}>{monthName} {year}</span>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 18, color: "#374151" }}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
        {DAYS_SHORT.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: d === "Sun" ? "#f87171" : "#9ca3af", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i}></div>;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const sunday = isSunday(day, month, year);
          const classDay = isClassDay(day, month, year);
          const isSelected = selectedDate && selectedDate.calDay === day && selectedDate.calMonth === month && selectedDate.calYear === year;

          let bg = "transparent";
          let textColor = sunday ? "#f87171" : "#374151";
          let border = "2px solid transparent";
          let fontWeight = sunday ? 600 : 400;
          let cursor = "default";

          if (isToday && !isSelected) {
            bg = "linear-gradient(135deg, #f97316, #ec4899)"; textColor = "#fff"; fontWeight = 800;
          } else if (isSelected) {
            bg = "linear-gradient(135deg, #f97316 50%, #10b981 50%)"; textColor = "#fff"; fontWeight = 800; cursor = "pointer";
          } else if (classDay) {
            bg = "#fff7ed"; textColor = "#f97316"; fontWeight = 700; border = "2px solid #f97316"; cursor = "pointer";
          }

          return (
            <div key={i} onClick={() => classDay && onDateClick(day, month, year)}
              style={{ textAlign: "center", padding: "8px 2px", borderRadius: 10, fontSize: 14, fontWeight, background: bg, color: textColor, cursor, border }}>
              {day}
              {classDay && !isSelected && (
                <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#f97316" }}></div>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#10b981" }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "#fff7ed", border: "2px solid #f97316" }}></div>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Class day — click to view</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#f97316" }}></div>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#10b981" }}></div>
          <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 2 }}>Both modules</span>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ module, highlightedDay, onExpand, expanded }) {
  const { from, to } = module.color;
  const highlightBg = module.moduleNumber === 1 ? "#fff7ed" : "#f0fdf4";

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 20 }}>
      <div onClick={onExpand} style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
        padding: "16px 20px", background: `linear-gradient(90deg, ${from}, ${to})`,
        borderRadius: 14, marginBottom: expanded ? 16 : 0,
      }}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>MODULE {module.moduleNumber} • {module.duration}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{module.title}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 10px" }}>
            <span style={{ fontSize: 13 }}>🕐</span>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{module.timeSlot}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>• 4 hrs/day</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 14px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{module.attendance}%</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>Attendance</div>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 14px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{module.modulePSP}%</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>PSP</div>
          </div>
          <span style={{ color: "#fff", fontSize: 22 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 8 }}>
          {module.days.map((day, index) => (
            <div id={`module${module.moduleNumber}-day-${index}`} key={day.id}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10, marginBottom: 6,
                background: highlightedDay === index ? highlightBg : "#fafafa",
                border: highlightedDay === index ? `2px solid ${from}` : "2px solid transparent",
                transition: "all 0.2s",
              }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: from, borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" }}>{day.label}</span>
              <span style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{day.date}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1f2937", flex: 1 }}>{day.topic}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", whiteSpace: "nowrap" }}>Lecture: {day.lecture}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [expandedModules, setExpandedModules] = useState({ 1: false, 2: false });
  const [highlightedDays, setHighlightedDays] = useState({ 1: null, 2: null });
  const [selectedDate, setSelectedDate] = useState(null);

  const toggleModule = (num) => setExpandedModules(prev => ({ ...prev, [num]: !prev[num] }));

  const handleDateClick = (calDay, calMonth, calYear) => {
    setSelectedDate({ calDay, calMonth, calYear });
    const newHighlights = {};
    modulesData.forEach((mod) => {
      const idx = mod.days.findIndex(d => d.calDay === calDay && d.calMonth === calMonth && d.calYear === calYear);
      newHighlights[mod.moduleNumber] = idx >= 0 ? idx : null;
    });
    setHighlightedDays(newHighlights);
    setExpandedModules({ 1: true, 2: true });
    setTimeout(() => {
      const idx = newHighlights[1];
      if (idx !== null && idx >= 0) {
        document.getElementById(`module1-day-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "32px 24px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>📚 Course Dashboard</h1>
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 28 }}>
        2 Modules • 1 Jun – 9 Jun 2026 • 4 hrs each per day
      </p>
      <div style={{ display: "flex", gap: 28, maxWidth: 1200, margin: "0 auto", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px" }}>
          <Calendar onDateClick={handleDateClick} selectedDate={selectedDate} />
        </div>
        <div style={{ flex: "1 1 400px" }}>
          {modulesData.map((mod) => (
            <ModuleCard key={mod.moduleNumber} module={mod}
              highlightedDay={highlightedDays[mod.moduleNumber]}
              expanded={expandedModules[mod.moduleNumber]}
              onExpand={() => toggleModule(mod.moduleNumber)} />
          ))}
        </div>
      </div>
    </div>
  );
} 