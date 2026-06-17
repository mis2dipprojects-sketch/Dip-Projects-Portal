import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://efqfjfthsleymhljswcq.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcWZqZnRoc2xleW1obGpzd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDY0MjMsImV4cCI6MjA5NTkyMjQyM30.PYMRiKdnhzb6pkvhDB4M4Qdp3nSGhsZpHGuclVqYNMs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const fmtD = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

function getInitials(name = "") {
  return name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = ["#d97706","#7c3aed","#0284c7","#16a34a","#dc2626","#0891b2"];
function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Profile({ user, onLogout, onThemeToggle, isDark }) {
  const [stats, setStats] = useState({ dpr: 0, wpr: 0, svr: 0, thisMonth: 0, lastDate: null });
  const [loading, setLoading] = useState(true);
  const [freshRole, setFreshRole] = useState(user?.role || "");
 const [freshName, setFreshName] = useState(user?.name || "");
 const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);

        // Fetch fresh site data for this user
        const { data: freshUser } = await supabase
            .from("user_details")
            .select("site_name, site_names, role, name, department")
            .eq("id", user.id)
            .single();
            if (freshUser) {
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            const updated = {
                ...stored,
                site_name:  freshUser.site_name  ?? stored.site_name,
                site_names: freshUser.site_names ?? (stored.site_name ? [stored.site_name] : []),
                role:       freshUser.role       ?? stored.role,
                name:       freshUser.name       ?? stored.name,
                department: freshUser.department ?? stored.department,
            };
            localStorage.setItem("user", JSON.stringify(updated));
            setFreshRole(freshUser.role || user?.role || "");
            setFreshName(freshUser.name || user?.name || "");
            // Update the local user object for display in this session
            user = { ...user, ...updated };
        }
        const { data } = await supabase
        .from("dpr_reports")
        .select("report_type, created_at, date")
        .eq("engineer", user.name)
        .order("created_at", { ascending: false });

      const reports = data || [];
      const thisMonthStr = new Date().toISOString().slice(0, 7);

      const dpr = reports.filter(r => r.report_type === "evening" || r.report_type === "morning").length;
      const svr = reports.filter(r => r.report_type === "site_visit").length;

      // Weekly from reports table
      const { data: wprData } = await supabase
        .from("reports")
        .select("id, created_at")
        .eq("user_id", user.id)
        .eq("report_type", "weekly");

      const wpr = (wprData || []).length;
      const thisMonth = reports.filter(r => (r.date || "").startsWith(thisMonthStr)).length;
      const lastDate = reports[0]?.date || null;

      setStats({ dpr, wpr, svr, thisMonth, lastDate });
      setLoading(false);
    })();
  }, [user]);

const initials = getInitials(freshName || user?.name || "");
const bgColor  = avatarColor(freshName || user?.name || "");

  return (
    
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Top: Avatar + Identity ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 14, padding: "28px 20px 24px",
        background: "var(--paper)", borderRadius: 14,
        border: "1px solid var(--line)"
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: bgColor, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 28, fontWeight: 800,
          color: "#fff", letterSpacing: 1, flexShrink: 0,
          boxShadow: `0 0 0 4px ${bgColor}33`
        }}>
          {initials}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>{freshName || user?.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink3)", marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
             {freshRole || user?.role || "Site Engineer"}
         </div>
          <div style={{
            marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--amber-bg)", border: "1px solid var(--amber-line)",
            borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "var(--amber2)"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {user?.site_names?.length  ? user.site_names.join("  |  ").toUpperCase()  : (user?.site_name || "No Site Assigned").toUpperCase()}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>

        {/* Info pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          {user?.user_name && (
            <span style={{ fontSize: 11.5, background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 8, padding: "4px 10px", color: "var(--ink2)", fontWeight: 600 }}>
              @{user.user_name}
            </span>
          )}
          {user?.email && (
            <span style={{ fontSize: 11.5, background: "var(--surface)", border: "1px solid var(--line2)", borderRadius: 8, padding: "4px 10px", color: "var(--ink2)", fontWeight: 600 }}>
              {user.email}
            </span>
          )}
        </div>
      </div>

      {/* ── Middle: Report Stats ── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
          Report Statistics
        </div>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink3)", fontSize: 13 }}>
            <div className="spinner" /> Loading stats…
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }}>
              {[
                { label: "DPR Reports", value: stats.dpr, color: "#d97706" },
                { label: "Weekly Reports", value: stats.wpr, color: "#7c3aed" },
                { label: "Site Visit", value: stats.svr, color: "#0284c7" },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
                  <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="stat-card">
                <div className="stat-val" style={{ color: "var(--green)", fontSize: 18 }}>{stats.thisMonth}</div>
                <div className="stat-lbl">This Month</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink2)" }}>
                  {stats.lastDate ? fmtD(stats.lastDate) : "—"}
                </div>
                <div className="stat-lbl">Last Submitted</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Bottom: Account Actions ── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
          Account
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>

          {/* Theme toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: 10, cursor: "pointer"
          }} onClick={onThemeToggle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 600, color: "var(--ink2)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {isDark
                  ? <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
                  : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                }
              </svg>
              {isDark ? "Light Mode" : "Dark Mode"}
            </div>
            <div style={{
              width: 38, height: 21, borderRadius: 11, background: isDark ? "var(--amber)" : "var(--line2)",
              position: "relative", transition: "background .25s", flexShrink: 0
            }}>
              <div style={{
                width: 15, height: 15, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3, left: isDark ? 20 : 3,
                transition: "left .25s", boxShadow: "0 1px 3px rgba(0,0,0,.25)"
              }}/>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 10,
              cursor: "pointer", fontSize: 13.5, fontWeight: 700,
              color: "#dc2626", width: "100%", textAlign: "left"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
      {/* ── Logout Confirmation Modal ── */}
{showLogoutModal && (
  <div
    onClick={() => setShowLogoutModal(false)}
    style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(15,10,5,0.65)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, animation: "nbFadeIn .18s ease",
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: "var(--surface)",
        border: "1.5px solid #c96a10",
        borderRadius: 18, padding: "32px 28px 24px",
        maxWidth: 360, width: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 10, textAlign: "center",
        boxShadow: "0 16px 48px rgba(61,18,0,0.25)",
        animation: "nbSlideUp .2s ease",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 4,
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>

      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>Sign Out?</div>
      <div style={{ fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.6 }}>
        You'll be returned to the login screen. Any unsaved changes will be lost.
      </div>

      {/* User chip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", width: "100%", margin: "4px 0",
        background: "linear-gradient(135deg,rgba(61,18,0,0.06),rgba(201,106,16,0.08))",
        border: "1px solid #c96a10", borderRadius: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)",
          color: "#fff", fontSize: 14, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {(freshName || user?.name || "").charAt(0).toUpperCase()}
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{freshName || user?.name}</div>
          <div style={{ fontSize: 11, color: "#7a2e00", fontWeight: 500 }}>{freshRole || user?.role || ""}</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 6 }}>
        <button
          onClick={() => setShowLogoutModal(false)}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            border: "1.5px solid #c96a10", background: "var(--surface)",
            color: "#7a2e00", fontFamily: "var(--font)",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all .15s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Cancel
        </button>
        <button
          onClick={onLogout}
          style={{
            flex: 1, height: 44, borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#3d1200,#7a2e00,#c96a10)",
            color: "#fff", fontFamily: "var(--font)",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: "0 3px 12px rgba(61,18,0,0.3)", transition: "all .15s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Yes, Sign Out
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}