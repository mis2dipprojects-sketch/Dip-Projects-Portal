
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://efqfjfthsleymhljswcq.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcWZqZnRoc2xleW1obGpzd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDY0MjMsImV4cCI6MjA5NTkyMjQyM30.PYMRiKdnhzb6pkvhDB4M4Qdp3nSGhsZpHGuclVqYNMs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
function spline(pts) {
  if (!pts.length) return "";
  const p = pts.map(s => s.split(",").map(Number));
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const [x0, y0] = p[i], [x1, y1] = p[i + 1];
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}
function calcScores(chartData) {
  const totalDpr     = chartData.reduce((s, m) => s + (m.dpr  || 0), 0);
  const totalWpr     = chartData.reduce((s, m) => s + (m.wpr  || 0), 0);

  // Working days: use _workDays if present, else approximate (26/month)
  const totalWorkDays = chartData.reduce((s, m) => s + (m._workDays ?? 26), 0);

  // Attendance: use _present/_half if present, else reconstruct from attendPct
  let presentDays = 0, halfDays = 0;
  chartData.forEach(m => {
    if (m._present !== undefined) {
      presentDays += m._present || 0;
      halfDays    += m._half    || 0;
    } else if (m.attendPct !== null && m.attendPct !== undefined) {
      const wd = m._workDays ?? 26;
      presentDays += Math.round((m.attendPct / 100) * wd);
    }
  });

  // ~26 weeks in 6 months
  const totalWeeks = Math.round(chartData.length * 4.33);

  const dpr = Math.min(100, totalWorkDays > 0
    ? Math.round((totalDpr / totalWorkDays) * 100) : 0);
  const wpr = Math.min(100, totalWeeks > 0
    ? Math.round((totalWpr / totalWeeks) * 100) : 0);
  const att = Math.min(100, totalWorkDays > 0
    ? Math.round(((presentDays + halfDays * 0.5) / totalWorkDays) * 100) : 0);
  const total = Math.round(dpr * 0.4 + wpr * 0.2 + att * 0.4);

  return { dpr, wpr, att, total, totalDpr, totalWpr, presentDays, halfDays, totalWorkDays, totalWeeks };
}

function scoreColor(s) {
  if (s >= 80) return "#16a34a";
  if (s >= 60) return "#d97706";
  return "#dc2626";
}
function scoreLabel(s) {
  if (s >= 90) return "Excellent";
  if (s >= 80) return "Good";
  if (s >= 60) return "Average";
  if (s >= 40) return "Below Avg";
  return "Poor";
}

// ── Ring SVG ──────────────────────────────────────────────────────────────────
function Ring({ score, size = 72, stroke = 7, color, label, sub, isMain = false }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke}/>
        {/* progress */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dasharray .6s ease" }}/>
        {/* score text */}
        <text x={size/2} y={size/2 - (isMain ? 5 : 3)} textAnchor="middle"
          fontSize={isMain ? 22 : 16} fontWeight={800}
          fill={color} fontFamily="'DM Sans',sans-serif">{score}</text>
        <text x={size/2} y={size/2 + (isMain ? 12 : 9)} textAnchor="middle"
          fontSize={isMain ? 8.5 : 7.5} fill="#94a3b8"
          fontFamily="'DM Sans',sans-serif">/ 100</text>
      </svg>
      {label && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: isMain ? 11 : 10, fontWeight: 700, color: "var(--ink2,#475569)" }}>
            {label}
          </div>
          {sub && (
            <div style={{ fontSize: isMain ? 10 : 9, color, fontWeight: 700 }}>{sub}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── PerformanceScore ──────────────────────────────────────────────────────────
export function PerformanceScore({ chartData }) {
  if (!chartData || !chartData.length) return null;
  const sc = calcScores(chartData);
  const tc = scoreColor(sc.total);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14,
      height: "100%",
    }}>
      {/* Section label */}
      <div style={{
        fontSize: 10, fontWeight: 800, color: "var(--ink3,#94a3b8)",
        textTransform: "uppercase", letterSpacing: ".1em",
      }}>
        Performance Score
      </div>

      {/* Main ring */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Ring score={sc.total} size={100} stroke={9} color={tc}
          label="Overall Score" sub={scoreLabel(sc.total)} isMain />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--line,#e2e8f0)" }}/>

      {/* Three individual rings */}
      <div style={{ display: "flex", justifyContent: "space-around", gap: 4 }}>
        <Ring score={sc.dpr} size={68} stroke={6} color="#d97706"
          label="DPR" sub={scoreLabel(sc.dpr)}/>
        <Ring score={sc.wpr} size={68} stroke={6} color="#7c3aed"
          label="WPR" sub={scoreLabel(sc.wpr)}/>
        <Ring score={sc.att} size={68} stroke={6} color="#0284c7"
          label="Attendance" sub={scoreLabel(sc.att)}/>
      </div>

      {/* Detail rows */}
      <div style={{
        background: "linear-gradient(135deg,rgba(61,18,0,0.03),rgba(201,106,16,0.05))",
        border: "1px solid var(--amber-line,rgba(201,106,16,0.2))",
        borderRadius: 10, padding: "10px 12px",
        display: "flex", flexDirection: "column", gap: 5,
        fontSize: 10.5, color: "var(--ink2,#475569)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#d97706", fontWeight: 700 }}>DPR</span>
          <span>{sc.totalDpr} reports / {sc.totalWorkDays} working days</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#7c3aed", fontWeight: 700 }}>WPR</span>
          <span>{sc.totalWpr} reports / ~{sc.totalWeeks} weeks</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#0284c7", fontWeight: 700 }}>Att.</span>
          <span>{sc.presentDays}P + {sc.halfDays}½ / {sc.totalWorkDays} days</span>
        </div>
        <div style={{
          marginTop: 4, paddingTop: 6,
          borderTop: "1px solid rgba(201,106,16,0.15)",
          fontSize: 9.5, color: "#94a3b8", lineHeight: 1.5,
        }}>
          DPR×40% + WPR×20% + Att×40%
        </div>
      </div>
    </div>
  );
}

// ── ActivityChart ─────────────────────────────────────────────────────────────
export function ActivityChart({ data, user }) {
  const [hovered, setHovered]           = useState(null);
  const [drillMonth, setDrillMonth]     = useState(null);
  const [drillData, setDrillData]       = useState([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillHovered, setDrillHovered] = useState(null);

  if (!data.length) return null;

  const W = 500, H = 155;
  const PAD = { top: 18, right: 38, bottom: 30, left: 30 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const openDrill = async (d, idx) => {
    const n = data.length;
    const mo = new Date();
    mo.setDate(1);
    mo.setMonth(mo.getMonth() - (n - 1 - idx));
    const yearMonth = mo.toISOString().slice(0, 7);
    const [y, m] = yearMonth.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const from = `${yearMonth}-01`;
    const to   = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;

    setDrillMonth({ label: d.label, yearMonth });
    setDrillData([]);
    setDrillLoading(true);
    setHovered(null);

    const [dprRes, wprRes, attRes] = await Promise.all([
      supabase.from("dpr_reports").select("date")
        .eq("engineer", user.name).eq("report_type", "evening")
        .gte("date", from).lte("date", to),
      supabase.from("wpr_reports").select("created_at")
        .or(`engineer_name.eq.${user.user_name},engineer_name.eq.${user.name}`)
        .gte("created_at", `${from}T00:00:00`).lte("created_at", `${to}T23:59:59`),
      supabase.from("attendance").select("date, status")
        .eq("user_name", user.user_name).gte("date", from).lte("date", to),
    ]);

    const days = [];
    for (let dd = 1; dd <= lastDay; dd++) {
      const dateStr = `${yearMonth}-${String(dd).padStart(2, "0")}`;
      if (new Date(dateStr).getDay() === 0) continue;
      const dayLabel = new Date(dateStr + "T00:00:00")
        .toLocaleDateString("en-IN", { day: "numeric", weekday: "short" });
      const hasDpr    = (dprRes.data || []).some(r => r.date === dateStr);
      const hasWpr    = (wprRes.data || []).some(r => (r.created_at || "").startsWith(dateStr));
      const attRow    = (attRes.data || []).find(r => r.date === dateStr);
      const attStatus = attRow?.status?.toLowerCase() || null;
      const attVal    = attStatus === "present" ? 1 : attStatus === "half day" ? 0.5 : attStatus === "absent" ? 0 : null;
      days.push({ dateStr, dayLabel, hasDpr, hasWpr, attStatus, attVal });
    }
    setDrillData(days);
    setDrillLoading(false);
  };

  const closeDrill = () => { setDrillMonth(null); setDrillData([]); setDrillHovered(null); };

  // ── MONTH VIEW ────────────────────────────────────────────────────────────
  const MonthChart = () => {
    const n = data.length;
    const sharedMax = Math.max(...data.map(d => Math.max(d.dpr, d.wpr)), 1);
    const yTicks = [0, Math.round(sharedMax / 2), sharedMax];
    const xPos = (i) => PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const yPos = (v, max) => PAD.top + innerH - Math.min(v / max, 1) * innerH;

const dprPts = data.filter(d => d.dpr !== null).map((d, _, arr) => `${xPos(data.indexOf(d))},${yPos(d.dpr, sharedMax)}`);
const wprPts = data.filter(d => d.wpr !== null).map((d) => `${xPos(data.indexOf(d))},${yPos(d.wpr, sharedMax)}`);
const attPts = data.filter(d => d.attendPct !== null).map(d => `${xPos(data.indexOf(d))},${yPos(d.attendPct, 100)}`);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}
        onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="dprGv3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7a2e00"/><stop offset="100%" stopColor="#d97706"/>
          </linearGradient>
          <linearGradient id="dprFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#d97706" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {yTicks.map(t => {
          const y = yPos(t, sharedMax);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="#e2e8f0" strokeWidth={t === 0 ? 1.2 : 0.6}
                strokeDasharray={t === 0 ? "none" : "3 3"}/>
              <text x={PAD.left - 4} y={y + 3.5} fontSize={8} fill="#94a3b8"
                textAnchor="end" fontFamily="monospace">{t}</text>
            </g>
          );
        })}
{[0, 50, 100].map(t => (
          <text key={`a${t}`} x={W - PAD.right + 4} y={yPos(t, 100) + 3.5}
            fontSize={8} fill="#c96a10" fontFamily="monospace">{t}%</text>
        ))}

        {(() => {
          const nullCount = data.filter(d => d.dpr === null && d.wpr === null).length;
          if (!nullCount || nullCount >= data.length) return null;
          const x0 = PAD.left;
          const x1 = xPos(nullCount - 1) + (xPos(1) - xPos(0)) * 0.5;
          return (
            <g style={{ pointerEvents: "none" }}>
              <rect x={x0} y={PAD.top} width={x1 - x0} height={innerH}
                fill="rgba(148,163,184,0.07)" rx={4}/>
              <line x1={x1} y1={PAD.top} x2={x1} y2={PAD.top + innerH}
                stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.4}/>
              <text x={(x0 + x1) / 2} y={PAD.top + 12} fontSize={8}
                textAnchor="middle" fill="#94a3b8" fontFamily="monospace">no data</text>
            </g>
          );
        })()}
{attPts.length > 0 && <path d={spline(attPts)} fill="none" stroke="#c96a10"
          strokeWidth={1.6} strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round"/>}
        {wprPts.length > 0 && <path d={spline(wprPts)} fill="none" stroke="#a78bfa"
          strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>}
        {dprPts.length > 0 && <>
          <path
            d={spline(dprPts) + ` L ${xPos(data.findIndex((d,i) => data.slice(i).every(x => x.dpr !== null) || i === data.length-1))} ${PAD.top + innerH} L ${xPos(data.findIndex(d => d.dpr !== null))} ${PAD.top + innerH} Z`}
            fill="url(#dprFill)" stroke="none"/>
          <path d={spline(dprPts)} fill="none" stroke="url(#dprGv3)"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        </>}

        {data.map((d, i) => {
          const cx = xPos(i);
          const isH = hovered === i;
          return (
            <g key={i} style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)} onClick={() => openDrill(d, i)}>
              <rect x={cx - innerW / Math.max(data.length, 1) / 2} y={PAD.top}
                width={innerW / Math.max(data.length, 1)} height={innerH + 20} fill="transparent"/>
              {isH && <line x1={cx} y1={PAD.top} x2={cx} y2={PAD.top + innerH}
                stroke="#c96a10" strokeWidth={1} strokeDasharray="3 2" strokeOpacity={0.5}/>}

              <circle cx={cx} cy={yPos(d.dpr, sharedMax)} r={isH ? 5 : 3.2}
                fill={isH ? "#d97706" : "#fff"} stroke="#d97706" strokeWidth={2}
                style={{ transition: "all .15s" }}/>
              <circle cx={cx} cy={yPos(d.wpr, sharedMax)} r={isH ? 5 : 3.2}
                fill={isH ? "#a78bfa" : "#fff"} stroke="#a78bfa" strokeWidth={2}
                style={{ transition: "all .15s" }}/>
              {d.attendPct !== null && (
                <circle cx={cx} cy={yPos(d.attendPct, 100)} r={isH ? 4 : 2.5}
                  fill={isH ? "#c96a10" : "#fff"} stroke="#c96a10" strokeWidth={1.5}
                  style={{ transition: "all .15s" }}/>
              )}
              <text x={cx} y={H - 4} fontSize={8.5} textAnchor="middle"
                fill={isH ? "#c96a10" : "#94a3b8"} fontWeight={isH ? 700 : 500}
                fontFamily="'DM Sans',sans-serif" style={{ transition: "fill .15s" }}>
                {d.label}
              </text>

              {isH && (() => {
                const bx = Math.min(Math.max(cx - 52, PAD.left), W - PAD.right - 110);
                const by = PAD.top - 2;
                return (
                  <g style={{ pointerEvents: "none" }}>
                    <rect x={bx} y={by} width={110}
                      height={d.attendPct !== null ? 62 : 46}
                      rx={6} fill="var(--surface,#fff)" stroke="#c96a10" strokeWidth={1}
                      style={{ filter: "drop-shadow(0 3px 8px rgba(61,18,0,0.15))" }}/>
                    <text x={bx + 8} y={by + 13} fontSize={8.5} fontWeight={800}
                      fill="var(--ink,#1e293b)" fontFamily="'DM Sans',sans-serif">
                      {d.label} · click to drill
                    </text>
                    <circle cx={bx + 10} cy={by + 26} r={3.5} fill="#d97706"/>
                    <text x={bx + 17} y={by + 30} fontSize={8.5} fill="var(--ink2,#475569)" fontFamily="'DM Sans',sans-serif">
                      DPR <tspan fontWeight={700} fill="#d97706">{d.dpr}</tspan>{"   "}
                    </text>
                    <circle cx={bx + 62} cy={by + 26} r={3.5} fill="#a78bfa"/>
                    <text x={bx + 69} y={by + 30} fontSize={8.5} fill="var(--ink2,#475569)" fontFamily="'DM Sans',sans-serif">
                      WPR <tspan fontWeight={700} fill="#7c3aed">{d.wpr}</tspan>
                    </text>
                    {d.attendPct !== null && (
                      <>
                        <circle cx={bx + 10} cy={by + 42} r={3.5} fill="#c96a10"/>
                        <text x={bx + 17} y={by + 46} fontSize={8.5} fill="var(--ink2,#475569)" fontFamily="'DM Sans',sans-serif">
                          Att. <tspan fontWeight={700} fill="#c96a10">{d.attendPct}%</tspan>
                        </text>
                      </>
                    )}
                  </g>
                );
              })()}
            </g>
          );
        })}
      </svg>
    );
  };

  // ── DAY VIEW ──────────────────────────────────────────────────────────────
  const DayChart = () => {
    if (drillLoading) return (
      <div style={{ height: H, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8, fontSize: 12, color: "#94a3b8" }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%",
          border: "2px solid #e2e8f0", borderTopColor: "#c96a10",
          animation: "spin .7s linear infinite" }}/>
        Loading {drillMonth?.label}…
      </div>
    );
    if (!drillData.length) return (
      <div style={{ height: H, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 12, color: "#94a3b8" }}>
        No data for this month.
      </div>
    );

    const nd = drillData.length;
    const xPos = (i) => PAD.left + (nd === 1 ? innerW / 2 : (i / (nd - 1)) * innerW);
    const yBin = (v) => PAD.top + innerH - v * innerH;
    const yAtt = (v) => PAD.top + innerH - v * innerH;
    const dprPts = drillData.map((d, i) => `${xPos(i)},${yBin(d.hasDpr ? 1 : 0)}`).join(" ");
    const wprPts = drillData.map((d, i) => `${xPos(i)},${yBin(d.hasWpr ? 1 : 0)}`).join(" ");
    const attPts = drillData.filter(d => d.attVal !== null)
      .map(d => `${xPos(drillData.indexOf(d))},${yAtt(d.attVal)}`).join(" ");
    const labelStep = nd <= 10 ? 1 : nd <= 20 ? 2 : 3;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}
        onMouseLeave={() => setDrillHovered(null)}>
        {[{ v: 1, label: "✓" }, { v: 0, label: "✗" }].map(({ v, label }) => (
          <g key={v}>
            <line x1={PAD.left} y1={yBin(v)} x2={W - PAD.right} y2={yBin(v)}
              stroke="#e2e8f0" strokeWidth={v === 0 ? 1.2 : 0.6}
              strokeDasharray={v === 0 ? "none" : "3 3"}/>
            <text x={PAD.left - 4} y={yBin(v) + 3.5} fontSize={9} fill="#94a3b8"
              textAnchor="end" fontFamily="monospace">{label}</text>
          </g>
        ))}
        {[{ v: 1, l: "P" }, { v: 0.5, l: "½" }, { v: 0, l: "A" }].map(({ v, l }) => (
          <text key={l} x={W - PAD.right + 4} y={yAtt(v) + 3.5}
            fontSize={8} fill="#c96a10" fontFamily="monospace">{l}</text>
        ))}

{attPts && <path d={spline(attPts.split(" "))} fill="none" stroke="#c96a10"
          strokeWidth={1.6} strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round"/>}
        <path d={spline(wprPts.split(" "))} fill="none" stroke="#a78bfa"
          strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
        <path d={spline(dprPts.split(" "))} fill="none" stroke="#d97706"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>

        {drillData.map((d, i) => {
          const cx = xPos(i);
          const isH = drillHovered === i;
          const dprY = yBin(d.hasDpr ? 1 : 0);
          const wprY = yBin(d.hasWpr ? 1 : 0);
          const attY = d.attVal !== null ? yAtt(d.attVal) : null;
          return (
            <g key={i} style={{ cursor: "default" }} onMouseEnter={() => setDrillHovered(i)}>
              <rect x={cx - innerW / Math.max(nd, 1) / 2} y={PAD.top}
                width={innerW / Math.max(nd, 1)} height={innerH + 20} fill="transparent"/>
              {isH && <line x1={cx} y1={PAD.top} x2={cx} y2={PAD.top + innerH}
                stroke="#c96a10" strokeWidth={1} strokeDasharray="3 2" strokeOpacity={0.4}/>}
              <circle cx={cx} cy={dprY} r={isH ? 5 : 3.2}
                fill={d.hasDpr ? "#d97706" : "#fff"} stroke="#d97706" strokeWidth={2}
                style={{ transition: "all .12s" }}/>
              <circle cx={cx} cy={wprY} r={isH ? 5 : 3.2}
                fill={d.hasWpr ? "#a78bfa" : "#fff"} stroke="#a78bfa" strokeWidth={2}
                style={{ transition: "all .12s" }}/>
              {attY !== null && (
                <circle cx={cx} cy={attY} r={isH ? 4 : 2.5}
                  fill={d.attVal === 1 ? "#16a34a" : d.attVal === 0.5 ? "#d97706" : "#dc2626"}
                  stroke="none" style={{ transition: "all .12s" }}/>
              )}
              {i % labelStep === 0 && (
                <text x={cx} y={H - 4} fontSize={8} textAnchor="middle"
                  fill={isH ? "#c96a10" : "#94a3b8"} fontWeight={isH ? 700 : 400}
                  fontFamily="'DM Sans',sans-serif">{d.dayLabel}</text>
              )}
              {isH && (() => {
                const bx = Math.min(Math.max(cx - 50, PAD.left), W - PAD.right - 106);
                const by = PAD.top - 2;
                const attLabel = d.attStatus
                  ? d.attStatus.charAt(0).toUpperCase() + d.attStatus.slice(1) : "—";
                const attCol = d.attVal === 1 ? "#16a34a"
                             : d.attVal === 0.5 ? "#d97706"
                             : d.attVal === 0 ? "#dc2626" : "#94a3b8";
                return (
                  <g style={{ pointerEvents: "none" }}>
                    <rect x={bx} y={by} width={106} height={62}
                      rx={6} fill="var(--surface,#fff)" stroke="#c96a10" strokeWidth={1}
                      style={{ filter: "drop-shadow(0 3px 8px rgba(61,18,0,0.15))" }}/>
                    <text x={bx + 8} y={by + 13} fontSize={9} fontWeight={800}
                      fill="var(--ink,#1e293b)" fontFamily="'DM Sans',sans-serif">{d.dayLabel}</text>
                    <circle cx={bx + 10} cy={by + 26} r={3.5} fill="#d97706"/>
                    <text x={bx + 17} y={by + 30} fontSize={9} fill="var(--ink2,#475569)" fontFamily="'DM Sans',sans-serif">
                      DPR <tspan fontWeight={700} fill={d.hasDpr ? "#d97706" : "#94a3b8"}>{d.hasDpr ? "✓" : "—"}</tspan>
                    </text>
                    <circle cx={bx + 60} cy={by + 26} r={3.5} fill="#a78bfa"/>
                    <text x={bx + 67} y={by + 30} fontSize={9} fill="var(--ink2,#475569)" fontFamily="'DM Sans',sans-serif">
                      WPR <tspan fontWeight={700} fill={d.hasWpr ? "#7c3aed" : "#94a3b8"}>{d.hasWpr ? "✓" : "—"}</tspan>
                    </text>
                    <circle cx={bx + 10} cy={by + 42} r={3.5} fill={attCol}/>
                    <text x={bx + 17} y={by + 46} fontSize={9} fill="var(--ink2,#475569)" fontFamily="'DM Sans',sans-serif">
                      Att. <tspan fontWeight={700} fill={attCol}>{attLabel}</tspan>
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 22 }}>
        {drillMonth ? (
          <>
            <button onClick={closeDrill} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "none", border: "1px solid var(--line,#e2e8f0)",
              borderRadius: 6, padding: "3px 10px", cursor: "pointer",
              fontSize: 11, fontWeight: 700, color: "#7a2e00",
              fontFamily: "'DM Sans',sans-serif",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              6 Months
            </button>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#c96a10" }}>
              {drillMonth.label}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8" }}>
            Click a month to see day-wise breakdown
          </span>
        )}
      </div>

      {/* Chart */}
      <div style={{ background: "var(--paper)", border: "1px solid var(--line,#e2e8f0)",
        borderRadius: 12, padding: "14px 10px 10px" }}>
        {drillMonth ? <DayChart /> : <MonthChart />}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { color: "#d97706", label: "DPR", dash: false },
          { color: "#a78bfa", label: "WPR", dash: false },
          { color: "#c96a10", label: drillMonth ? "Attendance (P/½/A)" : "Attendance %", dash: true },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 600, color: "var(--ink2,#475569)" }}>
            <svg width={20} height={8}>
              <line x1={0} y1={4} x2={20} y2={4} stroke={l.color} strokeWidth={2}
                strokeDasharray={l.dash ? "4 2" : "none"} strokeLinecap="round"/>
            </svg>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}