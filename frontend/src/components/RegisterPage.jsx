
// frontend/src/components/RegisterPage.jsx
import { useState } from "react";
import { registerUser } from "@api/auth.js";

const ROLE_OPTIONS = [
  { key: "student", label: "Student" },
  { key: "advisor", label: "Advisor" },
  { key: "admin", label: "Admin" },
];

export default function RegisterPage({ onRegistered, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setErr("");

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setErr("Username and password are required.");
      return;
    }

    if (!role) {
      setErr("Please select a role.");
      return;
    }

    setLoading(true);

    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
    const body = {
      username: u,
      password: p,
      role: capitalizedRole,
      first_name: u,
      last_name: "",
    };

    if (role === "student") body.major = "Undeclared";
    if (role === "advisor") body.department = "General";

    try {
      await registerUser(body);
      onRegistered();
    } catch (error) {
      console.error(error);
      setErr(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card authCard">
      <h2>Create Account</h2>
      <p className="muted">
        Select a role and enter your desired username and password to register.
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
          <span>Role</span>
          <div className="roleGrid">
            {ROLE_OPTIONS.map((r) => (
              <label key={r.key} className="rolePill">
                <input
                  type="radio"
                  name="role"
                  value={r.key}
                  checked={role === r.key}
                  onChange={() => setRole(r.key)}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        {err ? <div className="error">{err}</div> : null}

        <div className="authActions">
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
          <button className="btn" type="button" onClick={onCancel} disabled={loading}>
            Back to Login
          </button>
        </div>
      </form>
    </section>
  );
}
