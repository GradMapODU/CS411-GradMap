
// frontend/src/components/LoginPage.jsx
import { useState } from "react";
import { loginUser } from "../../../api/auth.js";

export default function LoginPage({ onLoginSuccess, onGoRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

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
      const data = await loginUser({ username: u, password: p });
      const role = (data.role || "").toLowerCase();

      onLoginSuccess({
        username: u,
        roles: role ? [role] : [],
        activeRole: role,
        token: data.token,
      });
    } catch (error) {
      console.error(error);
      setErr(error.message || "Unable to sign in.");
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
            autoComplete="current-password"
          />
        </label>

        {err ? <div className="error">{err}</div> : null}

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

