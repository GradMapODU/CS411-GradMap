import { useMemo, useState } from "react";

const ROLE_OPTIONS = [
  { key: "student", label: "Student" },
  { key: "advisor", label: "Advisor" },
  { key: "admin", label: "Admin" },
];

export default function RegisterPage({ onRegistered, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState(["student"]);
  const [err, setErr] = useState("");

  const builtins = useMemo(
    () => ["student", "advisor", "admin"].map((x) => x.toLowerCase()),
    []
  );

  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem("gradmap_users") || "[]");
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem("gradmap_users", JSON.stringify(users));
  }

  function toggleRole(roleKey) {
    setRoles((prev) => {
      const has = prev.includes(roleKey);
      const next = has ? prev.filter((r) => r !== roleKey) : [...prev, roleKey];
      return next.length === 0 ? prev : next; // prevent 0 roles
    });
  }

  function handleCreate(e) {
    e.preventDefault();
    setErr("");

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setErr("Username and password are required.");
      return;
    }
    if (roles.length === 0) {
      setErr("Select at least one role.");
      return;
    }

    const users = loadUsers();
    const lower = u.toLowerCase();

    const taken =
      builtins.includes(lower) || users.some((x) => x.username.toLowerCase() === lower);

    if (taken) {
      setErr("That username is already taken.");
      return;
    }

    const newUser = { username: u, password: p, roles };
    saveUsers([...users, newUser]);

    onRegistered();
  }

  return (
    <section className="card authCard">
      <h2>Create Account</h2>
      <p className="muted">
        Pick one or more roles. (Example: an advisor could also be a student.)
      </p>

      <form onSubmit={handleCreate} className="authForm">
        <label className="field">
          <span>Username</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <div className="field">
          <span>Roles</span>
          <div className="roleGrid">
            {ROLE_OPTIONS.map((r) => (
              <label key={r.key} className="rolePill">
                <input
                  type="checkbox"
                  checked={roles.includes(r.key)}
                  onChange={() => toggleRole(r.key)}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        {err ? <div className="error">{err}</div> : null}

        <div className="authActions">
          <button className="btn primary" type="submit">
            Create
          </button>
          <button className="btn" type="button" onClick={onCancel}>
            Back to Login
          </button>
        </div>
      </form>
    </section>
  );
}
