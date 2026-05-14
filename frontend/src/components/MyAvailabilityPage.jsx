import { useEffect, useMemo, useState } from "react";
import { getAvailability, saveAvailability } from "@api/students.js";

const DAYS = [
  { id: "mon", label: "Mon", backend: "M" },
  { id: "tue", label: "Tue", backend: "T" },
  { id: "wed", label: "Wed", backend: "W" },
  { id: "thu", label: "Thu", backend: "R" },
  { id: "fri", label: "Fri", backend: "F" },
];


const BACKEND_TO_DAY_ID = DAYS.reduce((acc, d) => {
  acc[d.backend] = d.id;
  return acc;
}, {});


const DAY_ID_TO_BACKEND = DAYS.reduce((acc, d) => {
  acc[d.id] = d.backend;
  return acc;
}, {});

const HOUR_OPTIONS = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
];

const TIME_OPTIONS = [...HOUR_OPTIONS];


const TERM_SEMESTERS = ["Spring", "Summer", "Fall"];
const TERM_YEARS = [2026, 2027, 2028];
const TERM_OPTIONS = TERM_YEARS.flatMap((y) =>
  TERM_SEMESTERS.map((s) => `${s} ${y}`)
);

/*
function backend24hToLabel(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return null;
  const [hStr] = hhmm.split(":");
  const h = Number(hStr);
  if (Number.isNaN(h)) return null;

  const ampm = h >= 12 ? "PM" : "AM";
  let display = h % 12;
  if (display === 0) display = 12;
  return `${display}:00 ${ampm}`;
}
*/

function labelToBackend24h(label) {
  if (!label || typeof label !== "string") return null;
  const match = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let h = Number(match[1]);
  const m = Number(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeIndex(t) {
  return TIME_OPTIONS.indexOf(t);
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyWeeklyHours() {
  return { mon: [], tue: [], wed: [], thu: [], fri: [] };
}

function rowsToWeeklyHours(rows) {
  const weekly = createEmptyWeeklyHours();
  if (!Array.isArray(rows)) return weekly;

  function parseHour(hhmm) {
    if (!hhmm || typeof hhmm !== "string") return NaN;
    const h = Number(hhmm.split(":")[0]);
    return Number.isNaN(h) ? NaN : h;
  }

  const FIRST_HOUR = 6;
  const LAST_HOUR_EXCLUSIVE = FIRST_HOUR + HOUR_OPTIONS.length;

  for (const row of rows) {
    const dayId = BACKEND_TO_DAY_ID[row.day];
    if (!dayId) continue;

    const startHour = parseHour(row.start_time);
    const endHour = parseHour(row.end_time);
    if (Number.isNaN(startHour) || Number.isNaN(endHour)) continue;

    const fromIdx = Math.max(0, startHour - FIRST_HOUR);
    const toIdx = Math.min(HOUR_OPTIONS.length, endHour - FIRST_HOUR);
    if (toIdx <= fromIdx) continue;

    const set = new Set(weekly[dayId]);
    for (let i = fromIdx; i < toIdx; i++) {
      set.add(HOUR_OPTIONS[i]);
    }
    weekly[dayId] = HOUR_OPTIONS.filter((h) => set.has(h));
  }

  return weekly;
}

function weeklyHoursToRows(weeklyHours) {
  const rows = [];

  function startOf(i) {
    return labelToBackend24h(HOUR_OPTIONS[i]);
  }
  function endOf(i) {
    if (i + 1 < HOUR_OPTIONS.length) return labelToBackend24h(HOUR_OPTIONS[i + 1]);
    return "22:00";
  }

  for (const d of DAYS) {
    const selected = new Set(weeklyHours[d.id] || []);

    let runStart = -1; 
    for (let i = 0; i < HOUR_OPTIONS.length; i++) {
      const isOn = selected.has(HOUR_OPTIONS[i]);

      if (isOn && runStart === -1) {
        runStart = i;
      } else if (!isOn && runStart !== -1) {

        rows.push({
          day: DAY_ID_TO_BACKEND[d.id],
          start_time: startOf(runStart),
          end_time: endOf(i - 1),
        });
        runStart = -1;
      }
    }

    if (runStart !== -1) {
      rows.push({
        day: DAY_ID_TO_BACKEND[d.id],
        start_time: startOf(runStart),
        end_time: endOf(HOUR_OPTIONS.length - 1),
      });
    }
  }

  return rows;
}

function isHourWithinBlock(hour, block) {
  const hourIdx = timeIndex(hour);
  const startIdx = timeIndex(block.start);
  const endIdx = timeIndex(block.end);

  if (hourIdx === -1 || startIdx === -1 || endIdx === -1) return false;

  return hourIdx >= startIdx && hourIdx < endIdx;
}

export default function MyAvailabilityPage({ student, token }) {
  const [term, setTerm] = useState("Fall 2026");
  const [selectedDay, setSelectedDay] = useState("mon");
  const [weeklyHours, setWeeklyHours] = useState(createEmptyWeeklyHours);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDay, setNewDay] = useState("mon");
  const [newStart, setNewStart] = useState("2:00 PM");
  const [newEnd, setNewEnd] = useState("3:00 PM");
  const [newRepeats, setNewRepeats] = useState("Weekly");

  async function fetchAndApplyAvailability() {
    const data = await getAvailability(token);

    let weekly;
    if (Array.isArray(data)) {
      weekly = rowsToWeeklyHours(data);
    } else if (data && typeof data === "object" && data.weeklyHours) {
      weekly = {
        mon: Array.isArray(data.weeklyHours.mon) ? data.weeklyHours.mon : [],
        tue: Array.isArray(data.weeklyHours.tue) ? data.weeklyHours.tue : [],
        wed: Array.isArray(data.weeklyHours.wed) ? data.weeklyHours.wed : [],
        thu: Array.isArray(data.weeklyHours.thu) ? data.weeklyHours.thu : [],
        fri: Array.isArray(data.weeklyHours.fri) ? data.weeklyHours.fri : [],
      };
    } else {
      weekly = createEmptyWeeklyHours();
    }

    setWeeklyHours(weekly);
  }

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await fetchAndApplyAvailability();
      } catch (err) {
        console.error("Failed to load availability:", err);
        setError("Failed to load availability. Using defaults.");
        setWeeklyHours(createEmptyWeeklyHours());
      } finally {
        setLoading(false);
      }
    }
    load();

  }, [token]);

  const selectedDayHours = useMemo(() => {
    return new Set(weeklyHours[selectedDay] || []);
  }, [weeklyHours, selectedDay]);

  function toggleHour(dayId, hour) {
    setWeeklyHours((prev) => {
      const current = new Set(prev[dayId] || []);
      if (current.has(hour)) current.delete(hour);
      else current.add(hour);

      return {
        ...prev,
        [dayId]: HOUR_OPTIONS.filter((h) => current.has(h)),
      };
    });

    setSaveMsg(null);
  }

  function setAllHoursForDay(dayId, enabled) {
    setWeeklyHours((prev) => ({
      ...prev,
      [dayId]: enabled ? [...HOUR_OPTIONS] : [],
    }));
    setSaveMsg(null);
  }

  async function handleSaveAvailability() {
    if (!token) {
      alert("You must be logged in to save availability.");
      return;
    }

    try {
      setSaving(true);
      setSaveMsg(null);
      setError(null);

      const rows = weeklyHoursToRows(weeklyHours);
      await saveAvailability(token, rows);

      await fetchAndApplyAvailability();

      setSaveMsg(`Availability saved successfully for ${term}!`);
    } catch (err) {
      console.error("Failed to save availability:", err);
      setError(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function handleAddBlock() {
    if (!newTitle.trim()) {
      alert("Please enter a block title (e.g., Work, Appointment, Practice).");
      return;
    }

    const si = timeIndex(newStart);
    const ei = timeIndex(newEnd);

    if (si !== -1 && ei !== -1 && ei <= si) {
      alert("Block end time must be after start time.");
      return;
    }

    const block = {
      id: uid(),
      title: newTitle.trim(),
      day: newDay,
      start: newStart,
      end: newEnd,
      repeats: newRepeats,
    };

    setBlocks((prev) => [block, ...prev]);
    setNewTitle("");
  }

  function handleRemoveBlock(id) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function handleEditBlock(id) {
    const b = blocks.find((x) => x.id === id);
    console.log("[MyAvailability] Edit block (mock):", b);
    alert(`Mock: Edit "${b?.title ?? "Block"}" (not implemented yet).`);
  }

  function handleClearAllBlocks() {
    if (!blocks.length) return;
    if (!confirm("Clear all constraint blocks?")) return;
    setBlocks([]);
  }

  const previewRows = useMemo(() => {
    const blocksByDay = {};
    for (const d of DAYS) blocksByDay[d.id] = [];
    for (const b of blocks) blocksByDay[b.day]?.push(b);

    return HOUR_OPTIONS.map((hour) => {
      const cells = DAYS.map((d) => {
        const isAvailable = (weeklyHours[d.id] || []).includes(hour);

        const coveringBlock = (blocksByDay[d.id] || []).find((b) =>
          isHourWithinBlock(hour, b)
        );

        return {
          dayId: d.id,
          hour,
          isAvailable,
          coveringBlock,
        };
      });

      return { time: hour, cells };
    });
  }, [weeklyHours, blocks]);

  if (loading) {
    return (
      <section className="card">
        <h2>My Availability</h2>
        <p className="muted">Loading availability…</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>My Availability</h2>

      <p className="muted">
        Viewing availability for <b>{student?.name ?? "Student"}</b>
      </p>

      <p className="muted">
        Select a term, choose a day, and toggle the hours you are free for classes.
      </p>

      {error && (
        <div className="panel" style={{ borderLeft: "4px solid #e53e3e", marginBottom: 12 }}>
          <p style={{ color: "#e53e3e", margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {saveMsg && (
        <div className="panel" style={{ borderLeft: "4px solid #38a169", marginBottom: 12 }}>
          <p style={{ color: "#38a169", margin: 0 }}>✓ {saveMsg}</p>
        </div>
      )}

      <div className="grid">
        <div className="panel">
          <h3>Weekly Availability</h3>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <label className="muted">
              Term{" "}
              <select value={term} onChange={(e) => setTerm(e.target.value)}>
                {TERM_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="muted" style={{ marginBottom: 6 }}>
              Select Day
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DAYS.map((d) => (
                <button
                  key={d.id}
                  className={`btn ${selectedDay === d.id ? "active" : ""}`}
                  type="button"
                  onClick={() => setSelectedDay(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn" type="button" onClick={() => setAllHoursForDay(selectedDay, true)}>
              Mark Full Day Free
            </button>
            <button className="btn" type="button" onClick={() => setAllHoursForDay(selectedDay, false)}>
              Clear Day
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="muted" style={{ marginBottom: 8 }}>
              {DAYS.find((d) => d.id === selectedDay)?.label} Hours
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {HOUR_OPTIONS.map((hour) => {
                const isOn = selectedDayHours.has(hour);

                return (
                  <button
                    key={hour}
                    type="button"
                    className={`btn ${isOn ? "active" : ""}`}
                    onClick={() => toggleHour(selectedDay, hour)}
                    aria-pressed={isOn}
                    title={isOn ? `${hour} is free` : `${hour} is blocked`}
                    style={{
                      opacity: isOn ? 1 : 0.45,
                      minWidth: 88,
                    }}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="actions" style={{ marginTop: 16 }}>
            <button
              className="btn primary"
              onClick={handleSaveAvailability}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Availability"}
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>Constraint Blocks</h3>
          <p className="muted" style={{ marginTop: 4 }}>
            Add time blocks for work, commute, athletics, appointments, etc.
          </p>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Block title (e.g., Work)"
              aria-label="Block title"
              style={{ minWidth: 220 }}
            />

            <select value={newDay} onChange={(e) => setNewDay(e.target.value)} aria-label="Block day">
              {DAYS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>

            <select
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              aria-label="Block start time"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              aria-label="Block end time"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={newRepeats}
              onChange={(e) => setNewRepeats(e.target.value)}
              aria-label="Repeat"
            >
              <option value="Weekly">Weekly</option>
              <option value="One-time">One-time</option>
            </select>

            <button className="btn" onClick={handleAddBlock}>
              + Add Block
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            {blocks.length === 0 ? (
              <p className="muted">No constraint blocks yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Repeat</th>
                    <th style={{ width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((b) => (
                    <tr key={b.id}>
                      <td>{b.title}</td>
                      <td>{DAYS.find((d) => d.id === b.day)?.label ?? b.day}</td>
                      <td>
                        {b.start} – {b.end}
                      </td>
                      <td>{b.repeats}</td>
                      <td>
                        <button className="btn" onClick={() => handleEditBlock(b.id)}>
                          Edit
                        </button>{" "}
                        <button className="btn" onClick={() => handleRemoveBlock(b.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="actions" style={{ marginTop: 10 }}>
              <button className="btn" onClick={handleClearAllBlocks} disabled={!blocks.length}>
                Clear All Blocks
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Preview Calendar (Read-only)</h3>
        <p className="muted" style={{ marginTop: 4 }}>
          Highlighted hours are free. Block entries override availability visually.
        </p>

        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              {DAYS.map((d) => (
                <th key={d.id}>{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row) => (
              <tr key={row.time}>
                <td>{row.time}</td>
                {row.cells.map((c) => {
                  let text = "Blocked";
                  let title = "Blocked / unavailable";
                  let className = "muted";

                  if (c.coveringBlock) {
                    text = `Constraint: ${c.coveringBlock.title}`;
                    title = `${c.coveringBlock.title} (${c.coveringBlock.start}–${c.coveringBlock.end})`;
                    className = "";
                  } else if (c.isAvailable) {
                    text = "Free";
                    title = "Available for classes";
                    className = "";
                  }

                  return (
                    <td key={c.dayId} title={title} className={className}>
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <p className="muted" style={{ marginTop: 8 }}>
          Legend: Free = hour enabled • Blocked = hour disabled • Constraint = manual block
        </p>
      </div>
    </section>
  );
}