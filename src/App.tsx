import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Predict from "./Predict";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={styles.nav}>
        <div style={styles.brand}>Math Coach AI</div>

        <div style={styles.navLinks}>
          <NavLink
            to="/predict"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            Predict
          </NavLink>

          <NavLink
            to="/login"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            Register
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/predict" replace />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    padding: "12px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    background: "rgba(0,0,0,0.35)",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(12px)",
  },
  brand: {
    fontWeight: 900,
    letterSpacing: 0.2,
    color: "white",
    fontSize: 16,
    whiteSpace: "nowrap",
  },
  navLinks: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap", // ✅ makes it responsive on small screens
    justifyContent: "flex-end",
  },
  link: {
    textDecoration: "none",
    color: "white",
    fontWeight: 800,
    fontSize: 14,
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    transition: "transform 0.15s ease, background 0.15s ease, border 0.15s ease",
  },
  linkActive: {
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.30)",
    transform: "translateY(-1px)",
  },
};