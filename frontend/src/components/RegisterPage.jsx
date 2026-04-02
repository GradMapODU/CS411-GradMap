// frontend/src/components/RegisterPage.jsx
//
// Updated RegisterPage component that connects to the backend API.  It
// registers a new user by sending a POST to `/api/auth/register` with the
// appropriate body.  Only one role can be selected.  Placeholder values
// are provided for first_name, last_name, and the role-specific fields
// `major` or `department` to satisfy the backend model requirements.

import { useState } from "react";

const ROLE_OPTIONS = [
  { key: "student", label: "Student" },
  { key: "advisor", label: "Advisor" },
  { key: "admin", label: "Admin" },
];

export default function RegisterPage({ onRegistered, onCancel }) {
  // State for username, password, selected role, error messages and loading flag
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles creation of a new user by calling the backend register endpoint.
   * Ensures a username, password and a role are provided.  The role is
   * capitalised before sending.  Placeholder values are passed for name
   * fields and for major/department depending on the role so the backend
   * models can accept the request.  On success, the parent callback is
   * invoked.
   */
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Registration failed. Please try again.");
      } else {
        onRegistered();
      }
    } catch (errCaught) {
      // Log error so the variable is used and ESLint passes
      console.error(errCaught);
      setErr("Unable to reach server. Please try again later.");
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