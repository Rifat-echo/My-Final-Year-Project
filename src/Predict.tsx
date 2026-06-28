import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type PredictResponse = {
  prediction: number;
  feedback: string[];
  saved_id?: number;
};

type StudyTimeOption = {
  value: number;
  label: string;
  hint: string;
};

const STUDYTIME_OPTIONS: StudyTimeOption[] = [
  { value: 1, label: "1 — Under 2 hours/week", hint: "Very low weekly study time" },
  { value: 2, label: "2 — 2 to 5 hours/week", hint: "Some study outside class" },
  { value: 3, label: "3 — 5 to 10 hours/week", hint: "Good consistent study habit" },
  { value: 4, label: "4 — Over 10 hours/week", hint: "Very strong weekly study time" },
];

export default function Predict() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // protect route
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const [studytime, setStudytime] = useState(3);
  const [failures, setFailures] = useState(0);
  const [absences, setAbsences] = useState(4);
  const [g1, setG1] = useState(12);
  const [g2, setG2] = useState(14);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const studytimeHint = useMemo(() => {
    return STUDYTIME_OPTIONS.find((o) => o.value === studytime)?.hint ?? "";
  }, [studytime]);

  const gradeLabel = useMemo(() => {
    if (!result) return null;
    const x = result.prediction;
    if (x >= 16) return { text: "Excellent", color: "#16a34a" };
    if (x >= 12) return { text: "Good", color: "#2563eb" };
    if (x >= 8) return { text: "Average", color: "#f59e0b" };
    return { text: "Needs work", color: "#dc2626" };
  }, [result]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const presets = {
    Low: { studytime: 1, failures: 2, absences: 25, g1: 8, g2: 9 },
    Average: { studytime: 2, failures: 1, absences: 10, g1: 11, g2: 12 },
    High: { studytime: 3, failures: 0, absences: 2, g1: 15, g2: 16 },
  };

  const applyPreset = (key: keyof typeof presets) => {
    const p = presets[key];
    setStudytime(p.studytime);
    setFailures(p.failures);
    setAbsences(p.absences);
    setG1(p.g1);
    setG2(p.g2);
    setResult(null);
    setError(null);
  };

  const onPredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studytime,
          failures,
          absences,
          G1: g1,
          G2: g2,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || "Prediction failed.");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (e) {
      setError("Backend not reachable. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  // Simple “friendly” split: advice vs positive
  const { improve, helps } = useMemo(() => {
    const msgs = result?.feedback ?? [];
    const improveWords = ["increase", "improve", "reduce", "try", "focus", "practice", "revise", "catch up"];
    const improveList: string[] = [];
    const helpsList: string[] = [];

    for (const m of msgs) {
      const lower = m.toLowerCase();
      const isImprove = improveWords.some((w) => lower.includes(w));
      if (isImprove) improveList.push(m);
      else helpsList.push(m);
    }

    return { improve: improveList, helps: helpsList };
  }, [result]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.title}>Math Coach AI</div>
            <div style={styles.subtitle}>
              Enter your info to estimate your final grade, then read what to improve.
            </div>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

        <div style={styles.grid}>
          {/* INPUT CARD */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Student Inputs</div>
            <div style={styles.cardHint}>Pick values that match your current situation.</div>

            <div style={styles.presetRow}>
              <button style={styles.presetBtn} onClick={() => applyPreset("Low")}>Low</button>
              <button style={styles.presetBtn} onClick={() => applyPreset("Average")}>Average</button>
              <button style={styles.presetBtn} onClick={() => applyPreset("High")}>High</button>
            </div>

            {/* Study time dropdown */}
            <div style={{ marginTop: 14 }}>
              <div style={styles.fieldTop}>
                <div>
                  <div style={styles.fieldLabel}>Weekly study time</div>
                  <div style={styles.helperText}>{studytimeHint}</div>
                </div>

                <select
                  value={studytime}
                  onChange={(e) => setStudytime(Number(e.target.value))}
                  style={styles.select}
                >
                  {STUDYTIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Field
              label="Past failures"
              helper="How many times you failed a class previously (0–4)."
              value={failures}
              min={0}
              max={4}
              step={1}
              onChange={setFailures}
            />

            <Field
              label="Absences"
              helper="How many classes you missed (0–93). Lower is better."
              value={absences}
              min={0}
              max={93}
              step={1}
              onChange={setAbsences}
            />

            <Field
              label="First test score (G1)"
              helper="Your first test grade (0–20)."
              value={g1}
              min={0}
              max={20}
              step={1}
              onChange={setG1}
            />

            <Field
              label="Second test score (G2)"
              helper="Your second test grade (0–20)."
              value={g2}
              min={0}
              max={20}
              step={1}
              onChange={setG2}
            />

            <button onClick={onPredict} style={styles.predictBtn} disabled={loading}>
              {loading ? "Predicting..." : "Predict"}
            </button>

            {error && <div style={styles.errorBox}>{error}</div>}
          </div>

          {/* OUTPUT CARD */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Results</div>
            <div style={styles.cardHint}>Prediction + simple feedback.</div>

            {!result && !loading && (
              <div style={styles.emptyState}>
                No prediction yet. Enter values and press <b>Predict</b>.
              </div>
            )}

            {loading && <div style={styles.emptyState}>Running model…</div>}

            {result && (
              <>
                <div style={styles.resultBox}>
                  <div style={styles.resultLabel}>Predicted final grade (0–20)</div>
                  <div style={styles.resultValue}>
                    {Number(result.prediction).toFixed(2)}
                    <span
                      style={{
                        ...styles.badge,
                        background: gradeLabel?.color || "#111",
                      }}
                    >
                      {gradeLabel?.text}
                    </span>
                  </div>
                  <div style={styles.smallText}>
                    Saved prediction ID: <b>{result.saved_id ?? "—"}</b>
                  </div>
                </div>

                <div style={styles.sectionTitle}>What to improve</div>
                {improve.length ? (
                  <ul style={styles.list}>
                    {improve.map((msg, i) => (
                      <li key={i} style={styles.listItem}>
                        {msg}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={styles.smallText}>No clear improvements detected from your inputs.</div>
                )}

                <div style={styles.sectionTitle}>What is helping</div>
                {helps.length ? (
                  <ul style={styles.list}>
                    {helps.map((msg, i) => (
                      <li key={i} style={styles.listItem}>
                        {msg}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={styles.smallText}>Nothing strongly positive stood out this time.</div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          Tip: Later we can add a <b>History</b> page so students can view past predictions.
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  helper,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  helper: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={styles.fieldTop}>
        <div>
          <div style={styles.fieldLabel}>{label}</div>
          <div style={styles.helperText}>{helper}</div>
        </div>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          style={styles.numberInput}
        />
      </div>

      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={styles.slider}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 24,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "linear-gradient(135deg, #0b1220 0%, #0f172a 45%, #111827 100%)",
    color: "white",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
  },
  title: { fontSize: 34, fontWeight: 800, letterSpacing: 0.2 },
  subtitle: { opacity: 0.75, marginTop: 6, lineHeight: 1.4, maxWidth: 720 },
  logoutBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    height: 42,
  },

  // responsive grid without media queries
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 18,
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 18,
    backdropFilter: "blur(10px)",
  },
  cardTitle: { fontSize: 18, fontWeight: 800 },
  cardHint: { opacity: 0.7, marginTop: 6, fontSize: 14 },

  presetRow: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  },
  presetBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "white",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
  },

  fieldTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  fieldLabel: { fontWeight: 800, opacity: 0.95 },
  helperText: { opacity: 0.7, fontSize: 12, marginTop: 4, maxWidth: 420 },

  numberInput: {
    width: 90,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    outline: "none",
    height: 38,
  },
  select: {
    width: 260,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    outline: "none",
    height: 38,
  },

  slider: { width: "100%", marginTop: 10 },

  predictBtn: {
    width: "100%",
    marginTop: 18,
    padding: 12,
    borderRadius: 14,
    border: "none",
    background: "white",
    color: "black",
    fontWeight: 900,
    cursor: "pointer",
  },

  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    background: "rgba(220,38,38,0.18)",
    border: "1px solid rgba(220,38,38,0.35)",
  },

  emptyState: {
    marginTop: 16,
    opacity: 0.8,
    padding: 16,
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.25)",
  },

  resultBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  resultLabel: { opacity: 0.75, fontWeight: 800 },
  resultValue: {
    fontSize: 34,
    fontWeight: 900,
    marginTop: 6,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  badge: {
    color: "white",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 900,
  },

  sectionTitle: { marginTop: 18, fontWeight: 900, fontSize: 16 },
  list: { marginTop: 10, paddingLeft: 18 },
  listItem: { marginBottom: 10, lineHeight: 1.4 },

  smallText: { marginTop: 8, opacity: 0.75, fontSize: 13 },

  footer: {
    marginTop: 14,
    opacity: 0.7,
    fontSize: 13,
  },
};