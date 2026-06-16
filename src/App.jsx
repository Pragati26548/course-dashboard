import { useState } from "react";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSunday(day, month, year) {
  return new Date(year, month, day).getDay() === 0;
}

function isClassDay(day, month, year, startDate, endDate) {
  const d = new Date(year, month, day);
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  return d >= start && d <= end && !isSunday(day, month, year);
}

function datesOverlap(start1, end1, start2, end2) {
  const [sy1, sm1, sd1] = start1.split("-").map(Number);
  const [ey1, em1, ed1] = end1.split("-").map(Number);
  const [sy2, sm2, sd2] = start2.split("-").map(Number);
  const [ey2, em2, ed2] = end2.split("-").map(Number);
  const s1 = new Date(sy1, sm1 - 1, sd1);
  const e1 = new Date(ey1, em1 - 1, ed1);
  const s2 = new Date(sy2, sm2 - 1, sd2);
  const e2 = new Date(ey2, em2 - 1, ed2);
  return s1 <= e2 && s2 <= e1;
}

function parseTime(timeStr) {
  if (!timeStr) return null;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let hrs = parseInt(match[1]);
  const mins = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hrs !== 12) hrs += 12;
  if (period === "AM" && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
}

function getSlotType(timeSlot, hoursPerDay) {
  if (parseInt(hoursPerDay) >= 8) return "fullday";
  const parts = timeSlot.split(/\s*[–-]\s*/);
  if (parts.length < 2) return "unknown";
  const startMins = parseTime(parts[0]);
  if (startMins === null) return "unknown";
  return startMins < 12 * 60 ? "morning" : "evening";
}

function checkSlotAvailability(modules, startDate, endDate, hoursPerDay, editingId = null) {
  let morningTaken = false;
  let eveningTaken = false;
  modules.forEach(mod => {
    if (editingId && mod.id === editingId) return;
    if (!datesOverlap(startDate, endDate, mod.startDate, mod.endDate)) return;
    const slotType = getSlotType(mod.timeSlot, mod.duration);
    if (slotType === "fullday") { morningTaken = true; eveningTaken = true; }
    else if (slotType === "morning") morningTaken = true;
    else if (slotType === "evening") eveningTaken = true;
  });
  return { morningTaken, eveningTaken };
}

function generateDays(startDate, endDate, topicsText) {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const days = [];
  let current = new Date(start);
  let dayCount = 1;
  const topicList = topicsText.split("\n").filter(t => t.trim());
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  while (current <= end) {
    if (current.getDay() !== 0) {
      days.push({
        date: `${current.getDate()} ${months[current.getMonth()]}`,
        calDay: current.getDate(),
        calMonth: current.getMonth(),
        calYear: current.getFullYear(),
        topic: topicList[dayCount - 1] || `Topic ${dayCount}`,
      });
      dayCount++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function Calendar({ onDateClick, selectedDate, collapsed, modules }) {
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
  const isAnyModuleClassDay = (day) =>
    modules.some(mod => isClassDay(day, month, year, mod.startDate, mod.endDate));
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: collapsed ? 16 : 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      {!collapsed ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 18 }}>‹</button>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#1f2937" }}>{monthName} {year}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 18 }}>›</button>
        </div>
      ) : (
        <div style={{ fontWeight: 800, fontSize: 14, color: "#1f2937", marginBottom: 8, textAlign: "center" }}>{monthName} {year}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {DAYS_SHORT.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: collapsed ? 9 : 12, fontWeight: 700, color: d === "Sun" ? "#f87171" : "#9ca3af" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: collapsed ? 2 : 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i}></div>;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const classDay = isAnyModuleClassDay(day);
          const isSelected = selectedDate && selectedDate.day === day && selectedDate.month === month && selectedDate.year === year;
          let bg = "transparent", textColor = isSunday(day, month, year) ? "#f87171" : "#374151", border = "2px solid transparent", cursor = "default";
          if (isSelected) { bg = "linear-gradient(135deg, #f97316, #10b981)"; textColor = "#fff"; cursor = "pointer"; }
          else if (isToday) { bg = "linear-gradient(135deg, #f97316, #ec4899)"; textColor = "#fff"; }
          else if (classDay) { bg = "#fff7ed"; textColor = "#f97316"; border = "2px solid #f97316"; cursor = "pointer"; }
          return (
            <div key={i} onClick={() => classDay && onDateClick(day, month, year)}
              style={{ textAlign: "center", padding: collapsed ? "4px 1px" : "8px 2px", borderRadius: collapsed ? 6 : 10, fontSize: collapsed ? 10 : 13, background: bg, color: textColor, cursor, border, fontWeight: classDay ? 700 : 400 }}>
              {day}
            </div>
          );
        })}
      </div>
      {!collapsed && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#fff7ed", border: "2px solid #f97316" }}></div>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Class day — click to view</span>
        </div>
      )}
    </div>
  );
}

function ModuleCard({ module, highlightedDay, expanded, onExpand, onClose, onEdit }) {
  const { from, to } = module.color;
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", flex: "1 1 300px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "12px 16px", background: `linear-gradient(90deg, ${from}, ${to})`, borderRadius: 14, marginBottom: expanded ? 12 : 0 }}
        onClick={() => expanded ? onClose(module.id) : onExpand(module.id)}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>MODULE {module.moduleNumber}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{module.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{module.duration} hrs/day</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "2px 8px" }}>
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>🕐 {module.timeSlot}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); onEdit(module); }}
            style={{ background: "rgba(255,255,255,0.25)", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff" }}>
            ✏️ Edit
          </button>
          <span style={{ color: "#fff", fontSize: 18 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 8 }}>
          {module.days.map((day, index) => (
            <div id={`module${module.id}-day-${index}`} key={index}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, marginBottom: 4, background: highlightedDay === index ? "#fff7ed" : "#fafafa", border: highlightedDay === index ? `2px solid ${from}` : "2px solid transparent" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: from, borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" }}>DAY {index + 1}</span>
              <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{day.date}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1f2937", flex: 1 }}>{day.topic}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SlotPopup({ message, onClose }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 400, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <p style={{ fontSize: 15, color: "#1f2937", fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        <button onClick={onClose}
          style={{ background: "linear-gradient(90deg, #f97316, #ec4899)", border: "none", borderRadius: 12, padding: "12px 32px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff" }}>
          OK, Got It
        </button>
      </div>
    </div>
  );
}

function ModuleForm({ onSave, onClose, nextModuleNumber, modules, editingModule }) {
  const isEditing = !!editingModule;
  const [form, setForm] = useState({
    title: editingModule?.title || "",
    hoursPerDay: editingModule?.duration || "",
    timeSlot: editingModule?.timeSlot || "",
    slotChoice: "",
    startDate: editingModule?.startDate || "",
    endDate: editingModule?.endDate || "",
    topics: editingModule?.days.map(d => d.topic).join("\n") || "",
  });
  const [slotError, setSlotError] = useState("");
  const colors = [
    { from: "#f97316", to: "#ec4899" },
    { from: "#10b981", to: "#0ea5e9" },
    { from: "#8b5cf6", to: "#ec4899" },
    { from: "#f43f5e", to: "#f97316" },
    { from: "#0ea5e9", to: "#6366f1" },
    { from: "#14b8a6", to: "#84cc16" },
  ];
  const handleHoursChange = (val) => {
    const hrs = parseInt(val);
    if (hrs >= 8) {
      setForm(prev => ({ ...prev, hoursPerDay: val, timeSlot: "9:00 AM – 6:00 PM", slotChoice: "" }));
    } else {
      setForm(prev => ({ ...prev, hoursPerDay: val, timeSlot: "", slotChoice: "" }));
    }
  };
  const handleSlotChoice = (choice) => {
    const slot = choice === "morning" ? "9:00 AM – 1:00 PM" : "1:30 PM – 5:30 PM";
    setForm(prev => ({ ...prev, slotChoice: choice, timeSlot: slot }));
  };
  const handleSubmit = () => {
    if (!form.title || !form.hoursPerDay || !form.timeSlot || !form.startDate || !form.endDate) {
      alert("Please fill in all required fields!");
      return;
    }
    if (form.startDate && form.endDate) {
      const { morningTaken, eveningTaken } = checkSlotAvailability(
        modules, form.startDate, form.endDate, form.hoursPerDay,
        isEditing ? editingModule.id : null
      );
      const newSlotType = getSlotType(form.timeSlot, form.hoursPerDay);
      if (morningTaken && eveningTaken) {
        setSlotError("Both morning and evening slots are already full for the selected date range. Please choose different dates.");
        return;
      }
      if (newSlotType === "fullday" && (morningTaken || eveningTaken)) {
        const takenSlot = morningTaken ? "morning" : "evening";
        setSlotError(`Cannot add a full-day module. The ${takenSlot} slot is already taken for this date range.`);
        return;
      }
      if (newSlotType === "morning" && morningTaken) {
        setSlotError(!eveningTaken
          ? "Morning slot is already taken for this date range. However, Evening slot is available! Please select a time after 12:00 PM."
          : "Morning slot is already taken and Evening slot is also full. Please choose different dates.");
        return;
      }
      if (newSlotType === "evening" && eveningTaken) {
        setSlotError(!morningTaken
          ? "Evening slot is already taken for this date range. However, Morning slot is available! Please select a time before 12:00 PM."
          : "Evening slot is already taken and Morning slot is also full. Please choose different dates.");
        return;
      }
    }
    const days = generateDays(form.startDate, form.endDate, form.topics);
    const moduleNumber = isEditing ? editingModule.moduleNumber : nextModuleNumber;
    onSave({
      id: isEditing ? editingModule.id : Date.now(),
      moduleNumber,
      title: form.title,
      timeSlot: form.timeSlot,
      duration: form.hoursPerDay,
      startDate: form.startDate,
      endDate: form.endDate,
      color: isEditing ? editingModule.color : colors[(moduleNumber - 1) % colors.length],
      days,
    });
    onClose();
  };
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", marginTop: 4 };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151" };
  const hrs = parseInt(form.hoursPerDay);
  return (
    <>
      {slotError && <SlotPopup message={slotError} onClose={() => setSlotError("")} />}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1f2937" }}>{isEditing ? "Edit Module" : "Add New Module"}</h2>
            <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Module Name *</label>
              <input style={inputStyle} placeholder="e.g. Data Engineering" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Hours per Day *</label>
              <input style={inputStyle} placeholder="e.g. 4 or 8" type="number" value={form.hoursPerDay} onChange={e => handleHoursChange(e.target.value)} />
            </div>
            {hrs >= 8 && (
              <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", border: "1.5px solid #10b981" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>✓ Time Slot: 9:00 AM – 6:00 PM (auto)</span>
              </div>
            )}
            {hrs > 0 && hrs < 8 && (
              <div>
                <label style={labelStyle}>Time Slot * <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 12 }}>(e.g. 9:00 AM – 1:00 PM)</span></label>
                <div style={{ display: "flex", gap: 10, marginTop: 6, marginBottom: 8 }}>
                  <button onClick={() => handleSlotChoice("morning")}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: form.slotChoice === "morning" ? "2px solid #f97316" : "1.5px solid #e5e7eb", background: form.slotChoice === "morning" ? "#fff7ed" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: form.slotChoice === "morning" ? "#f97316" : "#374151" }}>
                    Morning<br /><span style={{ fontSize: 11, fontWeight: 400 }}>9:00 AM – 1:00 PM</span>
                  </button>
                  <button onClick={() => handleSlotChoice("evening")}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: form.slotChoice === "evening" ? "2px solid #10b981" : "1.5px solid #e5e7eb", background: form.slotChoice === "evening" ? "#f0fdf4" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: form.slotChoice === "evening" ? "#10b981" : "#374151" }}>
                    Evening<br /><span style={{ fontSize: 11, fontWeight: 400 }}>1:30 PM – 5:30 PM</span>
                  </button>
                </div>
                <input style={inputStyle} placeholder="Or type custom time: e.g. 9:00 AM – 12:00 PM"
                  value={form.timeSlot}
                  onChange={e => setForm({...form, timeSlot: e.target.value, slotChoice: ""})} />
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Start Date *</label>
                <input style={inputStyle} type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>End Date *</label>
                <input style={inputStyle} type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Topics (one topic per line)</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                placeholder={"Topic 1\nTopic 2\nTopic 3"}
                value={form.topics}
                onChange={e => setForm({...form, topics: e.target.value})} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#6b7280" }}>Cancel</button>
            <button onClick={handleSubmit} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(90deg, #f97316, #ec4899)", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff" }}>
              {isEditing ? "Save Changes" : "Add Module"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [modules, setModules] = useState([
    {
      id: 1, moduleNumber: 1, title: "Data Engineering", timeSlot: "9:00 AM – 1:00 PM", duration: "4",
      startDate: "2026-06-01", endDate: "2026-06-09",
      color: { from: "#f97316", to: "#ec4899" },
      days: [
        { date: "1 JUN", calDay: 1, calMonth: 5, calYear: 2026, topic: "Data Engineering 101" },
        { date: "2 JUN", calDay: 2, calMonth: 5, calYear: 2026, topic: "Introduction to Data Engineering" },
        { date: "3 JUN", calDay: 3, calMonth: 5, calYear: 2026, topic: "Writing Efficient Queries: Part 1" },
        { date: "4 JUN", calDay: 4, calMonth: 5, calYear: 2026, topic: "Writing Efficient Queries: Part 2" },
        { date: "5 JUN", calDay: 5, calMonth: 5, calYear: 2026, topic: "Intro to Hadoop" },
        { date: "6 JUN", calDay: 6, calMonth: 5, calYear: 2026, topic: "HDFS and MAP-REDUCE" },
        { date: "8 JUN", calDay: 8, calMonth: 5, calYear: 2026, topic: "Introduction to Hive" },
        { date: "9 JUN", calDay: 9, calMonth: 5, calYear: 2026, topic: "Advanced features of Hive" },
      ],
    },
    {
      id: 2, moduleNumber: 2, title: "Machine Learning", timeSlot: "1:30 PM – 5:30 PM", duration: "4",
      startDate: "2026-06-01", endDate: "2026-06-09",
      color: { from: "#10b981", to: "#0ea5e9" },
      days: [
        { date: "1 JUN", calDay: 1, calMonth: 5, calYear: 2026, topic: "Introduction to ML" },
        { date: "2 JUN", calDay: 2, calMonth: 5, calYear: 2026, topic: "Supervised Learning" },
        { date: "3 JUN", calDay: 3, calMonth: 5, calYear: 2026, topic: "Linear Regression" },
        { date: "4 JUN", calDay: 4, calMonth: 5, calYear: 2026, topic: "Logistic Regression" },
        { date: "5 JUN", calDay: 5, calMonth: 5, calYear: 2026, topic: "Decision Trees" },
        { date: "6 JUN", calDay: 6, calMonth: 5, calYear: 2026, topic: "Random Forest" },
        { date: "8 JUN", calDay: 8, calMonth: 5, calYear: 2026, topic: "Model Evaluation" },
        { date: "9 JUN", calDay: 9, calMonth: 5, calYear: 2026, topic: "Feature Engineering" },
      ],
    },
  ]);
  const [expandedModules, setExpandedModules] = useState({});
  const [highlightedDays, setHighlightedDays] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const handleSaveModule = (moduleData) => {
    setModules(prev => {
      const exists = prev.find(m => m.id === moduleData.id);
      if (exists) return prev.map(m => m.id === moduleData.id ? moduleData : m);
      return [...prev, moduleData];
    });
  };
  const handleExpand = (id) => setExpandedModules(prev => ({ ...prev, [id]: true }));
  const handleClose = (id) => {
    const newExpanded = { ...expandedModules, [id]: false };
    setExpandedModules(newExpanded);
    if (Object.values(newExpanded).every(v => !v)) {
      setSelectedDate(null);
      setHighlightedDays({});
      setCalendarCollapsed(false);
    }
  };
  const handleDateClick = (day, month, year) => {
    setSelectedDate({ day, month, year });
    setCalendarCollapsed(true);
    const newHighlights = {}, newExpanded = {};
    modules.forEach(mod => {
      const idx = mod.days.findIndex(d => d.calDay === day && d.calMonth === month && d.calYear === year);
      newHighlights[mod.id] = idx >= 0 ? idx : null;
      newExpanded[mod.id] = idx >= 0;
    });
    setHighlightedDays(newHighlights);
    setExpandedModules(newExpanded);
  };
  const openAddForm = () => { setEditingModule(null); setShowForm(true); };
  const openEditForm = (mod) => { setEditingModule(mod); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingModule(null); };
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "32px 24px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#fff", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>📚 Course Dashboard</h1>
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 24 }}>
        {modules.length} Module{modules.length !== 1 ? "s" : ""}
      </p>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <button onClick={openAddForm}
          style={{ background: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#f97316", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          + Add New Module
        </button>
      </div>
      <div style={{ display: "flex", gap: 20, maxWidth: 1400, margin: "0 auto", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: calendarCollapsed ? "0 0 200px" : "0 0 320px", transition: "flex 0.3s" }}>
          <Calendar onDateClick={handleDateClick} selectedDate={selectedDate} collapsed={calendarCollapsed} modules={modules} />
        </div>
        <div style={{ flex: 1, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          {modules.map(mod => (
            <ModuleCard key={mod.id} module={mod}
              highlightedDay={highlightedDays[mod.id]}
              expanded={expandedModules[mod.id] || false}
              onExpand={handleExpand}
              onClose={handleClose}
              onEdit={openEditForm} />
          ))}
        </div>
      </div>
      {showForm && (
        <ModuleForm
          onSave={handleSaveModule}
          onClose={closeForm}
          nextModuleNumber={modules.length + 1}
          modules={modules}
          editingModule={editingModule}
        />
      )}
    </div>
  );
}