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

// ---- Professional, minimal color palette (Calendly-inspired) ----
const PALETTE = [
  { accent: "#0a66ff", soft: "#eaf1ff" }, // blue
  { accent: "#0d9488", soft: "#e6f7f5" }, // teal
  { accent: "#7c3aed", soft: "#f1ebfd" }, // violet
  { accent: "#dc2626", soft: "#fdecec" }, // red
  { accent: "#ca8a04", soft: "#fdf6e3" }, // amber
  { accent: "#059669", soft: "#e7f8f0" }, // green
];

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

  const getModulesForDay = (day) =>
    modules.filter(mod => isClassDay(day, month, year, mod.startDate, mod.endDate));

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: collapsed ? 16 : 24, border: "1px solid #e5e7eb" }}>
      {!collapsed ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 16, color: "#475569" }}>‹</button>
          <span style={{ fontWeight: 600, fontSize: 16, color: "#1e293b" }}>{monthName} {year}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 16, color: "#475569" }}>›</button>
        </div>
      ) : (
        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", marginBottom: 8, textAlign: "center" }}>{monthName} {year}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {DAYS_SHORT.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: collapsed ? 9 : 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: collapsed ? 2 : 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i}></div>;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayModules = getModulesForDay(day);
          const isClassday = dayModules.length > 0;
          const isSelected = selectedDate && selectedDate.day === day && selectedDate.month === month && selectedDate.year === year;
          const firstAccent = dayModules[0]?.color?.accent || "#0a66ff";

          let bg = "transparent";
          let textColor = isSunday(day, month, year) ? "#cbd5e1" : "#334155";
          let cursor = "default";

          if (isSelected) {
            bg = "#1e293b";
            textColor = "#fff";
            cursor = "pointer";
          } else if (isToday) {
            bg = "#1e293b";
            textColor = "#fff";
          } else if (isClassday) {
            textColor = firstAccent;
            cursor = "pointer";
          }

          return (
            <div key={i} onClick={() => isClassday && onDateClick(day, month, year)}
              style={{ textAlign: "center", padding: collapsed ? "4px 1px" : "8px 2px", borderRadius: 8, fontSize: collapsed ? 10 : 13, background: bg, color: textColor, cursor, fontWeight: isClassday || isToday || isSelected ? 700 : 400 }}>
              {day}
            </div>
          );
        })}
      </div>

      {!collapsed && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
          {modules.filter(mod => {
            for (let d = 1; d <= daysInMonth; d++) {
              if (isClassDay(d, month, year, mod.startDate, mod.endDate)) return true;
            }
            return false;
          }).map(mod => (
            <div key={mod.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: mod.color.accent }}></div>
              <span style={{ fontSize: 12, color: "#64748b" }}>{mod.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({ module, highlightedDay, expanded, onExpand, onClose, onEdit }) {
  const { accent } = module.color;
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", flex: "1 1 300px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "16px 18px", borderLeft: `3px solid ${accent}` }}
        onClick={() => expanded ? onClose(module.id) : onExpand(module.id)}>
        <div>
          <div style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>Module {module.moduleNumber}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginTop: 2 }}>{module.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>{module.duration} hrs/day</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>•</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{module.timeSlot}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <button onClick={e => { e.stopPropagation(); onEdit(module); }}
            style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#475569" }}>
            Edit
          </button>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 18px 16px 18px" }}>
          {module.days.map((day, index) => (
            <div id={`module${module.id}-day-${index}`} key={index}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, marginBottom: 4, background: highlightedDay === index ? module.color.soft : "#f8fafc", border: highlightedDay === index ? `1px solid ${accent}55` : "1px solid transparent" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: accent, background: module.color.soft, borderRadius: 6, padding: "3px 7px", whiteSpace: "nowrap" }}>DAY {index + 1}</span>
              <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{day.date}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#334155", flex: 1 }}>{day.topic}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SlotPopup({ message, onClose }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 400, width: "90%", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <p style={{ fontSize: 14, color: "#1e293b", fontWeight: 500, lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
        <button onClick={onClose}
          style={{ background: "#0a66ff", border: "none", borderRadius: 8, padding: "10px 28px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff" }}>
          Got it
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
      color: isEditing ? editingModule.color : PALETTE[(moduleNumber - 1) % PALETTE.length],
      days,
    });
    onClose();
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", marginTop: 4, color: "#1e293b" };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#334155" };
  const hrs = parseInt(form.hoursPerDay);

  return (
    <>
      {slotError && <SlotPopup message={slotError} onClose={() => setSlotError("")} />}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{isEditing ? "Edit Module" : "Add New Module"}</h2>
            <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 14, color: "#64748b" }}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Module Name *</label>
              <input style={inputStyle} placeholder="e.g. Data Engineering" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Hours per Day *</label>
              <input style={inputStyle} placeholder="e.g. 4 or 8" type="number" value={form.hoursPerDay} onChange={e => handleHoursChange(e.target.value)} />
            </div>
            {hrs >= 8 && (
              <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "9px 12px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>✓ Time Slot: 9:00 AM – 6:00 PM (auto)</span>
              </div>
            )}
            {hrs > 0 && hrs < 8 && (
              <div>
                <label style={labelStyle}>Time Slot * <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 11 }}>(e.g. 9:00 AM – 1:00 PM)</span></label>
                <div style={{ display: "flex", gap: 8, marginTop: 6, marginBottom: 8 }}>
                  <button onClick={() => handleSlotChoice("morning")}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, border: form.slotChoice === "morning" ? "1.5px solid #0a66ff" : "1px solid #e2e8f0", background: form.slotChoice === "morning" ? "#eaf1ff" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: form.slotChoice === "morning" ? "#0a66ff" : "#475569" }}>
                    Morning<br /><span style={{ fontSize: 10, fontWeight: 400 }}>9:00 AM – 1:00 PM</span>
                  </button>
                  <button onClick={() => handleSlotChoice("evening")}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, border: form.slotChoice === "evening" ? "1.5px solid #059669" : "1px solid #e2e8f0", background: form.slotChoice === "evening" ? "#e7f8f0" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: form.slotChoice === "evening" ? "#059669" : "#475569" }}>
                    Evening<br /><span style={{ fontSize: 10, fontWeight: 400 }}>1:30 PM – 5:30 PM</span>
                  </button>
                </div>
                <input style={inputStyle} placeholder="Or type custom time: e.g. 9:00 AM – 12:00 PM"
                  value={form.timeSlot}
                  onChange={e => setForm({...form, timeSlot: e.target.value, slotChoice: ""})} />
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
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
              <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                placeholder={"Topic 1\nTopic 2\nTopic 3"}
                value={form.topics}
                onChange={e => setForm({...form, topics: e.target.value})} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Cancel</button>
            <button onClick={handleSubmit} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: "#0a66ff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff" }}>
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
      color: PALETTE[0],
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
      color: PALETTE[1],
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
    const isSameDate = selectedDate && selectedDate.day === day && selectedDate.month === month && selectedDate.year === year;
    if (isSameDate) {
      setSelectedDate(null);
      setHighlightedDays({});
      setExpandedModules({});
      setCalendarCollapsed(false);
      return;
    }
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
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 24px", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: "#0f172a", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Course Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            {modules.length} module{modules.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <button onClick={openAddForm}
            style={{ background: "#0a66ff", border: "none", borderRadius: 8, padding: "11px 22px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff" }}>
            + Add New Module
          </button>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
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