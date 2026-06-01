import { useState } from "react";

const moduleData = {
  moduleNumber: 1,
  duration: "5 weeks",
  title: "Data Engineering",
  attendance: 0,
  modulePSP: 0,
  days: [
    { id: 1, date: "18 MAY", label: "DAY 1", topic: "Data Engineering 101", isOptional: false, masteryMode: null, lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 2, date: "20 MAY", label: "DAY 2", topic: "Introduction to Data Engineering", isOptional: false, masteryMode: null, lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 3, date: "22 MAY", label: "DAY 3", topic: "Writing Efficient Queries: Part 1", isOptional: false, masteryMode: null, lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 4, date: "24 MAY", label: "DAY 4", topic: "Writing Efficient Queries: Part 2", isOptional: false, masteryMode: null, lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 5, date: "26 MAY", label: "DAY 5", topic: "Intro to Hadoop", isOptional: false, masteryMode: null, lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 6, date: "28 MAY", label: "DAY 6", topic: "HDFS and MAP-REDUCE", isOptional: false, masteryMode: null, lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 7, date: "30 MAY", label: "DAY 7", topic: "Introduction to Hive", isOptional: false, masteryMode: null, lecture: 100, assignment: { done: 0, total: 10 } },
    { id: 8, date: "1 APR", label: "DAY 8", topic: "Advanced features of Hive", isOptional: false, masteryMode: null, lecture: 100, assignment: { done: 0, total: 10 } },
  ],
};

const dayColors = ["#f97316", "#8b5cf6", "#06b6d4", "#10b981", "#f43f5e", "#3b82f6", "#eab308", "#ec4899"];

function AssignmentBadge({ done, total }) {
  if (done === null || total === null) return <span style={{ color: "#9ca3af" }}>-</span>;
  const color = done === total ? "#16a34a" : "#dc2626";
  return <span style={{ color, fontWeight: 700 }}>{done} / {total}</span>;
}

export default function App() {
  const [expanded, setExpanded] = useState(null);
  const { moduleNumber, duration, title, attendance, modulePSP, days } = moduleData;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "32px 16px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", maxWidth: 960, margin: "0 auto", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(90deg, #f97316, #ec4899)", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 12px" }}>MODULE - {moduleNumber}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.25)", borderRadius: 999, padding: "2px 12px" }}>{duration}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>{title}</h1>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 20px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{attendance}%</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>Attendance</div>
            </div>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 20px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{modulePSP}%</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>Module PSP</div>
            </div>
          </div>
        </div>

        {/* Rows */}
        {days.map((day, index) => (
          <div
            key={day.id}
            onClick={() => setExpanded(expanded === day.id ? null : day.id)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 28px",
              borderBottom: "1px solid #f3f4f6",
              cursor: "pointer",
              background: expanded === day.id ? "#fdf4ff" : "#fff",
              transition: "background 0.2s",
            }}
          >
            {/* Color Bar */}
            <div style={{ width: 5, height: 40, borderRadius: 99, background: dayColors[index % dayColors.length], marginRight: 16 }} />

            {/* Left */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: dayColors[index % dayColors.length], borderRadius: 6, padding: "2px 10px" }}>{day.label}</span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{day.date}</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>{day.topic}</span>
            </div>

            {/* Mastery */}
            <div style={{ width: 130, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Mastery Mode</div>
              {day.masteryMode ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}> Achieved</span>
              ) : (
                <span style={{ color: "#9ca3af" }}>-</span>
              )}
            </div>

            {/* Lecture */}
            <div style={{ width: 110, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Lecture</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>{day.lecture}.0%</span>
            </div>

            {/* Assignment */}
            <div style={{ width: 110, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Assignment</div>
              <AssignmentBadge done={day.assignment?.done ?? null} total={day.assignment?.total ?? null} />
            </div>

            {/* Additional Problem */}
            <div style={{ width: 140, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Additional Problem</div>
              <span style={{ color: "#9ca3af" }}>-</span>
            </div>

            {/* Chevron */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={dayColors[index % dayColors.length]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded === day.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}