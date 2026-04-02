// frontend/src/components/LoginPage.jsx
//
// Updated LoginPage component that connects to the backend API.  This
// implementation removes the previous mock user handling and instead
// authenticates via `/api/auth/login`.  On successful login the returned
// JWT token and role are passed back to the parent component so that
// subsequent API calls can include the token.

import { useState } from "react";

export default function LoginPage({ onLoginSuccess, onGoRegister }) {
  // State for the username, password, error messages and a loading flag.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Submit handler for the login form.  Sends the credentials to the
   * backend and processes the response.  On success the JWT token and
   * lowercase role are sent up through onLoginSuccess.  Errors are
   * displayed to the user.
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    const u = username.trim();
    const p = password;
    if (!u || !p) {
      setErr("Please enter a username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Display a server‑provided error if available, otherwise generic message.
        setErr(data?.error || "Invalid username or password.");
      } else {
        const role = (data.role || "").toLowerCase();
        onLoginSuccess({
          username: u,
          roles: role ? [role] : [],
          activeRole: role,
          token: data.token,
        });
      }
    } catch (error) {
      // Log the error so that ESLint does not complain about unused vars
      console.error(error);
      setErr("Unable to reach server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card authCard">
      <h2>Login</h2>
      <p className="muted">
        Enter your username and password to sign in. If you do not have an
        account you can create one.
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
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <button
            className="btn"
            type="button"
            onClick={onGoRegister}
            disabled={loading}
          >
            Create Account
          </button>
        </div>
      </form>
    </section>
  );
}