// frontend/src/components/LoginPage.jsx
// #region LoginPage Component
// Handles user authentication (mock only, frontend-based)
// - Accepts built-in users (student/advisor/admin)
// - Accepts locally registered users (stored in localStorage)
// - Returns session object to App.jsx on success

// #region Imports
import { useMemo, useState } from "react";
// #endregion

export default function LoginPage({ onLoginSuccess, onGoRegister }) {

  // #region State Management
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  // #endregion


  // #region Built-in Mock Users (always available)
  // These simulate backend users that always exist
  // frontend/src/components/LoginPage.jsx

const builtins = useMemo(
  () => [
    // Students
    { username: "student1", password: "student1", roles: ["student"] },
    { username: "student2", password: "student2", roles: ["student"] },
    { username: "student3", password: "student3", roles: ["student"] },

    // Advisors
    { username: "advisor1", password: "advisor1", roles: ["advisor"] },
    { username: "advisor2", password: "advisor2", roles: ["advisor"] },

    // Admin
    { username: "admin", password: "admin", roles: ["admin"] },
  ],
  []
);
  // #endregion


  // #region Local Storage Utilities
  // Load any users created through registration page
  function loadRegisteredUsers() {
    try {
      return JSON.parse(localStorage.getItem("gradmap_users") || "[]");
    } catch {
      return [];
    }
  }
  // #endregion


  // #region Form Submission Handler
  function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    const u = username.trim();
    const p = password;

    // Basic validation
    if (!u || !p) {
      setErr("Please enter a username and password.");
      return;
    }

    // Combine built-in + registered users
    const registered = loadRegisteredUsers();
    const allUsers = [...builtins, ...registered];

    // Case-insensitive username check
    const match = allUsers.find(
      (x) => x.username.toLowerCase() === u.toLowerCase() && x.password === p
    );

    if (!match) {
      setErr("Invalid username or password.");
      return;
    }

    // Send session object back to App.jsx
    onLoginSuccess({
      username: match.username,
      roles: match.roles,
      activeRole: match.roles[0],
    });
  }
  // #endregion


  // #region Render
  return (
    <section className="card authCard">
      <h2>Login</h2>

      <p className="muted">
        Try: <b>student1/student1</b>, <b>student2/student2</b>, <b>student3/student3</b>,{" "}
        <b>advisor1/advisor1</b>, <b>advisor2/advisor2</b>, <b>admin/admin</b>
      </p>

      <form onSubmit={handleSubmit} className="authForm">

        {/* Username Field */}
        <label className="field">
          <span>Username</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        {/* Password Field */}
        <label className="field">
          <span>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {/* Error Display */}
        {err ? <div className="error">{err}</div> : null}

        {/* Action Buttons */}
        <div className="authActions">
          <button className="btn primary" type="submit">
            Sign In
          </button>

          <button
            className="btn"
            type="button"
            onClick={onGoRegister}
          >
            Create Account
          </button>
        </div>

      </form>
    </section>
  );
  // #endregion
}
// #endregion
