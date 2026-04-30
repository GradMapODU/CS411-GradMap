import { useEffect, useMemo, useState } from "react";
import { getAvailability, saveAvailability } from "@api/students.js";

const DAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
];

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

const TERM_OPTIONS = ["Spring 2026", "Summer 2026", "Fall 2026", "Winter 2026"];

function timeIndex(t) {
  return TIME_OPTIONS.indexOf(t);
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyWeeklyHours() {
  return { mon: [], tue: [], wed: [], thu: [], fri: [] };
}

function normalizeWeeklyHours(weeklyHours) {
  return {
    mon: Array.isArray(weeklyHours?.mon) ? weeklyHours.mon : [],
    tue: Array.isArray(weeklyHours?.tue) ? weeklyHours.tue : [],
    wed: Array.isArray(weeklyHours?.wed) ? weeklyHours.wed : [],
    thu: Array.isArray(weeklyHours?.thu) ? weeklyHours.thu : [],
    fri: Array.isArray(weeklyHours?.fri) ? weeklyHours.fri : [],
  };
}

function isHourWithinBlock(hour, block) {
  const hourIdx = timeIndex(hour);
  const startIdx = timeIndex(block.start);
  const endIdx = timeIndex(block.end);

  if (hourIdx === -1 || startIdx === -1 || endIdx === -1) return false;

  // inclusive start, exclusive end
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

  
  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getAvailability(token);
        setWeeklyHours(normalizeWeeklyHours(data?.weeklyHours));
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

      await saveAvailability(token, { weeklyHours });

      setSaveMsg("Availability saved successfully!");
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
