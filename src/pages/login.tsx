import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return username.trim().length >= 2 && password.length >= 3 && !loading;
  }, [username, password, loading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || "Login failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.access_token);
      navigate("/predict");
    } catch {
      setError("Backend not reachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.badge}>Math Coach AI</div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>
          Log in to see your predictions and improvement feedback.
        </p>

        <form onSubmit={onSubmit} style={styles.form}>
          {/* Username */}
          <label style={styles.label}>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoComplete="username"
            style={styles.input}
          />

          {/* Password */}
          <label style={{ ...styles.label, marginTop: 14 }}>Password</label>

          <div style={styles.pwWrap}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              style={styles.pwInput}
            />

            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              style={styles.eyeBtn}
            >
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              ...styles.loginBtn,
              opacity: canSubmit ? 1 : 0.6,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div style={styles.footer}>
            No account?{" "}
            <Link to="/register" style={styles.link}>
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background:
      "linear-gradient(135deg, #0b1220 0%, #0f172a 45%, #111827 100%)",
    color: "white",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    backdropFilter: "blur(12px)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.35)",
  },

  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 12,
  },

  title: {
    fontSize: 32,
    fontWeight: 900,
    margin: "0 0 6px 0",
  },

  subtitle: {
    opacity: 0.75,
    marginBottom: 18,
  },

  form: {
    marginTop: 10,
  },

  label: {
    fontWeight: 800,
    fontSize: 13,
  },

  input: {
    width: "100%",
    marginTop: 8,
    padding: "12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  },

  pwWrap: {
    position: "relative",
    marginTop: 8,
  },

  pwInput: {
    width: "100%",
    padding: "12px 56px 12px 12px", // extra space for eye button
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  },

  eyeBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    height: 34,
    width: 40,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer",
  },

  errorBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    background: "rgba(220,38,38,0.18)",
    border: "1px solid rgba(220,38,38,0.35)",
    fontWeight: 700,
  },

  loginBtn: {
    width: "100%",
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    border: "none",
    background: "white",
    color: "black",
    fontWeight: 900,
  },

  footer: {
    marginTop: 14,
    fontSize: 13,
    opacity: 0.85,
  },

  link: {
    color: "white",
    fontWeight: 900,
    textDecoration: "underline",
  },
};