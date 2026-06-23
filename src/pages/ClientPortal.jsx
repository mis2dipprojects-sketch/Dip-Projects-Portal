import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://efqfjfthsleymhljswcq.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcWZqZnRoc2xleW1obGpzd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDY0MjMsImV4cCI6MjA5NTkyMjQyM30.PYMRiKdnhzb6pkvhDB4M4Qdp3nSGhsZpHGuclVqYNMs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDateTime = iso => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

/**
 * Parse site_names from user_details.
 * DB stores it as a Postgres text[] — when JSON.parsed from localStorage it may be:
 *   - already a JS array: ["Amitbhai Bunglow", "B..."]
 *   - a Postgres array literal string: '{"Amitbhai Bunglow","B..."}'
 *   - a plain string (single site): "Amitbhai Bunglow"
 *   - null / undefined
 */
function parseSiteNames(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    // Postgres array literal: {"Site A","Site B"}
    if (raw.startsWith("{") && raw.endsWith("}")) {
      return raw
        .slice(1, -1)
        .match(/("(?:[^"\\]|\\.)*"|[^,]+)/g)
        ?.map(s => s.replace(/^"|"$/g, "").trim())
        .filter(Boolean) || [];
    }
    return [raw.trim()].filter(Boolean);
  }
  return [];
}

/**
 * Resolve the best site name to query against material_requirements.site_name.
 * Priority: site_names[0] → site_name
 * The material_requirements table stores site_name as typed by the requester,
 * so we do a case-insensitive query using ilike.
 */
function resolvePrimarySite(user) {
  const names = parseSiteNames(user?.site_names);
  if (names.length) return names[0];
  return user?.site_name || "";
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  .cp-wrap {
    min-height: 100vh;
    background: var(--bg, #f5f4f0);
  }
  .cp-inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 28px 16px 60px;
  }

  /* ── Hero ── */
  .cp-hero {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
    border-radius: 14px;
    padding: 28px 28px 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .cp-hero::before {
    content: "";
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }
  .cp-hero-label {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-bottom: 6px;
  }
  .cp-hero-name {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 4px;
  }
  .cp-hero-meta {
    font-size: 13px;
    color: rgba(255,255,255,0.55);
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    align-items: center;
  }
  .cp-hero-meta span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .cp-hero-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .cp-hero-site-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 13px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
  }
  .cp-hero-site-badge.active-site {
    background: rgba(16,163,74,0.25);
    border-color: rgba(16,163,74,0.5);
  }

  /* ── Site selector (multi-site clients) ── */
  .cp-site-selector {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 18px;
    padding: 14px 16px;
    background: #fff;
    border: 1.5px solid #e8e4df;
    border-radius: 10px;
    align-items: center;
  }
  .cp-site-label {
    font-size: 12px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-right: 4px;
  }
  .cp-site-chip {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1.5px solid #e2ddd8;
    background: #f5f4f0;
    font-size: 12.5px;
    font-weight: 700;
    color: #555;
    cursor: pointer;
    transition: all .15s;
    font-family: inherit;
  }
  .cp-site-chip:hover { border-color: #0f3460; color: #0f3460; }
  .cp-site-chip.act {
    background: #0f3460;
    border-color: #0f3460;
    color: #fff;
  }

  /* ── Section heading ── */
  .cp-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .cp-section-title {
    font-size: 15px;
    font-weight: 800;
    color: var(--ink, #1a1a1a);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cp-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    border-radius: 11px;
    font-size: 11px;
    font-weight: 800;
    background: #fef3c7;
    color: #92400e;
  }

  /* ── Filter chips ── */
  .cp-filters {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .cp-chip {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1.5px solid #e2ddd8;
    background: #fff;
    font-size: 12px;
    font-weight: 700;
    color: #666;
    cursor: pointer;
    transition: all .15s;
    font-family: inherit;
  }
  .cp-chip:hover { border-color: #1a1a2e; color: #1a1a2e; }
  .cp-chip.act        { background: #1a1a2e; border-color: #1a1a2e; color: #fff; }
  .cp-chip.act-green  { background: #166534; border-color: #166534; color: #fff; }
  .cp-chip.act-red    { background: #991b1b; border-color: #991b1b; color: #fff; }

  /* ── Material card ── */
  .cp-mcard {
    background: #fff;
    border: 1.5px solid #e8e4df;
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 10px;
    transition: box-shadow .18s;
  }
  .cp-mcard:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
  .cp-mcard.status-pending   { border-left: 4px solid #d97706; }
  .cp-mcard.status-accepted  { border-left: 4px solid #16a34a; }
  .cp-mcard.status-rejected  { border-left: 4px solid #dc2626; }
  .cp-mcard.status-received  { border-left: 4px solid #2563eb; }

  .cp-mcard-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .cp-mcard-name { font-size: 15px; font-weight: 800; color: #1a1a1a; }
  .cp-mcard-qty  { font-size: 13px; color: #555; margin-top: 2px; font-weight: 600; }

  .cp-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .cp-status.pending  { background: #fef3c7; color: #92400e; }
  .cp-status.accepted { background: #dcfce7; color: #166534; }
  .cp-status.rejected { background: #fee2e2; color: #991b1b; }
  .cp-status.received { background: #dbeafe; color: #1e40af; }

  .cp-mcard-meta { font-size: 12px; color: #888; line-height: 1.7; }
  .cp-mcard-meta strong { color: #555; }

  .cp-mcard-actions { display: flex; gap: 8px; margin-top: 12px; }
  .cp-btn {
    flex: 1; height: 38px; border: none; border-radius: 8px;
    font-family: inherit; font-size: 13px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 6px;
    transition: opacity .15s, transform .12s;
  }
  .cp-btn:hover   { opacity: .88; transform: translateY(-1px); }
  .cp-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
  .cp-btn-accept { background: #16a34a; color: #fff; }
  .cp-btn-reject { background: #fff; color: #dc2626; border: 1.5px solid #dc2626; }
  .cp-btn-reject:hover { background: #fef2f2; }

  /* ── Stats ── */
  .cp-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .cp-stat {
    background: #fff;
    border: 1.5px solid #e8e4df;
    border-radius: 10px;
    padding: 14px 16px;
    text-align: center;
  }
  .cp-stat-num        { font-size: 22px; font-weight: 800; color: #1a1a2e; line-height: 1; margin-bottom: 4px; }
  .cp-stat-num.green  { color: #16a34a; }
  .cp-stat-num.red    { color: #dc2626; }
  .cp-stat-num.amber  { color: #d97706; }
  .cp-stat-label      { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: .06em; }

  /* ── Empty / loading ── */
  .cp-empty {
    display: flex; flex-direction: column; align-items: center;
    padding: 48px 24px; text-align: center; gap: 10px; color: #aaa;
  }
  .cp-empty-title { font-size: 14px; font-weight: 700; color: #666; }
  .cp-empty-sub   { font-size: 13px; color: #aaa; }

  .cp-loading {
    display: flex; align-items: center; justify-content: center;
    padding: 40px; gap: 10px; color: #888; font-size: 13px;
  }
  .cp-spinner {
    width: 18px; height: 18px;
    border: 2.5px solid #e0dbd4;
    border-top-color: #1a1a2e;
    border-radius: 50%;
    animation: cpSpin .7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes cpSpin { to { transform: rotate(360deg); } }

  /* ── Toast ── */
  .cp-toast {
    position: fixed; bottom: 24px; right: 16px; z-index: 9999;
    padding: 12px 18px; border-radius: 10px; font-size: 13px;
    font-weight: 700; display: flex; align-items: center; gap: 8px;
    box-shadow: 0 4px 18px rgba(0,0,0,.15);
    animation: cpSlideUp .22s ease; max-width: 300px;
  }
  .cp-toast.ok  { background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #15803d; }
  .cp-toast.err { background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; }
  @keyframes cpSlideUp {
    from { transform: translateY(12px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  /* ── Confirm dialog ── */
  .cp-confirm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999; padding: 20px;
  }
  .cp-confirm-box {
    background: #fff; border-radius: 14px; padding: 26px 24px;
    max-width: 380px; width: 100%;
    box-shadow: 0 16px 48px rgba(0,0,0,.25);
  }
  .cp-confirm-title { font-size: 16px; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; }
  .cp-confirm-body  { font-size: 13.5px; color: #555; line-height: 1.55; margin-bottom: 20px; }
  .cp-confirm-btns  { display: flex; gap: 10px; }

  /* ── Debug info (small, subtle) ── */
  .cp-debug {
    margin-top: 12px;
    padding: 10px 14px;
    background: #f8f6f2;
    border: 1px dashed #ddd;
    border-radius: 8px;
    font-size: 11px;
    color: #aaa;
    font-family: monospace;
  }

  @media(max-width: 600px) {
    .cp-stats { grid-template-columns: 1fr 1fr; }
    .cp-hero  { padding: 20px; }
    .cp-mcard-actions { flex-direction: column; }
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
);
const IcoX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IcoClock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
);
const IcoUser = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IcoBox = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/>
  </svg>
);
const IcoSite = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

// ─── Status config ────────────────────────────────────────────────────────────
// DB only has: pending | received | rejected
// Client sees "received" displayed as "Accepted" (green)
const STATUS_CFG = {
  pending:  { label: "Pending",  icon: <IcoClock />, cls: "pending"  },
  received: { label: "Accepted", icon: <IcoCheck />, cls: "accepted" }, // DB=received → show as Accepted
  rejected: { label: "Rejected", icon: <IcoX />,     cls: "rejected" },
};

// ─── Confirm dialog ───────────────────────────────────────────────────────────
// action: "received" (client accepted) | "rejected"
function ConfirmDialog({ action, material, onConfirm, onCancel, loading }) {
  const isAccept = action === "received";
  return (
    <div className="cp-confirm-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="cp-confirm-box">
        <div className="cp-confirm-title">
          {isAccept ? "✅ Accept this request?" : "❌ Reject this request?"}
        </div>
        <div className="cp-confirm-body">
          {isAccept
            ? <>Approving <strong>{material}</strong> will allow the site team to proceed with procurement.</>
            : <>Rejecting <strong>{material}</strong> will notify the site team this item won't be supplied. This cannot be undone.</>
          }
        </div>
        <div className="cp-confirm-btns">
          <button
            className="cp-btn"
            style={{ background: isAccept ? "#16a34a" : "#dc2626", color: "#fff", flex: 1 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Saving…" : (isAccept ? "Yes, Accept" : "Yes, Reject")}
          </button>
          <button
            className="cp-btn"
            style={{ background: "#f0ede8", color: "#555", border: "1.5px solid #ddd", flex: 1 }}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single material card ─────────────────────────────────────────────────────
function MaterialCard({ r, onAction }) {
  const [actioning, setActioning] = useState(false);
  const [confirm,   setConfirm]   = useState(null); // "received" (accept) | "rejected"

  const status = r.status || "pending";
  const cfg    = STATUS_CFG[status] || STATUS_CFG.pending;

  const handleAction = async () => {
    setActioning(true);
    await onAction(r.id, confirm, r.material_name);
    setActioning(false);
    setConfirm(null);
  };

  return (
    <>
      {confirm && (
        <ConfirmDialog
          action={confirm}
          material={r.material_name}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actioning}
        />
      )}
      <div className={`cp-mcard status-${status}`}>
        <div className="cp-mcard-top">
          <div>
            <div className="cp-mcard-name">{r.material_name}</div>
            <div className="cp-mcard-qty">{r.quantity} {r.unit_name}</div>
          </div>
          <span className={`cp-status ${cfg.cls}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        <div className="cp-mcard-meta">
          <span><IcoUser /> Requested by <strong>{r.requested_by || "—"}</strong></span>
          {" · "}
          <span><IcoClock /> {fmtDateTime(r.created_at)}</span>
          {/* received = client accepted it */}
          {status === "received" && r.actioned_at && (
            <><br />Accepted by <strong>{r.actioned_by || "Client"}</strong> on {fmtDateTime(r.actioned_at)}</>
          )}
          {status === "rejected" && r.actioned_at && (
            <><br />Rejected by <strong>{r.actioned_by || "Client"}</strong> on {fmtDateTime(r.actioned_at)}</>
          )}
        </div>

        {status === "pending" && (
          <div className="cp-mcard-actions">
            {/* Accept → writes "received" to DB */}
            <button className="cp-btn cp-btn-accept" onClick={() => setConfirm("received")} disabled={actioning}>
              <IcoCheck /> Accept
            </button>
            <button className="cp-btn cp-btn-reject" onClick={() => setConfirm("rejected")} disabled={actioning}>
              <IcoX /> Reject
            </button>
          </div>
        )}
      </div>
    </>
  );
}
// ─── Material requests panel ──────────────────────────────────────────────────
function MaterialRequests({ siteName, userName }) {
  const [rows,    setRows]    = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("pending");
  const [toast,   setToast]   = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // "accepted" filter tab queries DB status = "received"
  // "rejected" filter tab queries DB status = "rejected"
  const dbStatusForFilter = f => {
    if (f === "accepted") return "received";
    if (f === "rejected") return "rejected";
    if (f === "pending")  return "pending";
    return null; // "all"
  };

  const load = useCallback(async () => {
    if (!siteName) { setLoading(false); return; }
    setLoading(true);
    let q = supabase
      .from("material_requirements")
      .select("*")
      .ilike("site_name", siteName);
    const dbStatus = dbStatusForFilter(filter);
    if (dbStatus) q = q.eq("status", dbStatus);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (!error) setRows(data || []);
    setLoading(false);
  }, [siteName, filter]);

  // Separate query for stats (all statuses)
  const loadStats = useCallback(async () => {
    if (!siteName) return;
    const { data } = await supabase
      .from("material_requirements")
      .select("status")
      .ilike("site_name", siteName);
    setAllRows(data || []);
  }, [siteName]);

  useEffect(() => { load(); loadStats(); }, [load, loadStats]);

  const handleAction = async (id, newStatus, materialName) => {
    // newStatus is "received" (accept) or "rejected" — both valid in DB constraint
    const { error } = await supabase
      .from("material_requirements")
      .update({
        status:      newStatus,
        actioned_at: new Date().toISOString(),
        actioned_by: userName || "Client",
      })
      .eq("id", id);

    if (error) { showToast("err", "Update failed: " + error.message); return; }
    showToast(
      "ok",
      newStatus === "received"
        ? `✅ "${materialName}" accepted.`
        : `❌ "${materialName}" rejected.`
    );
    load();
    loadStats();
  };

  // "accepted" count = DB rows with status "received"
  const stats = {
    pending:  allRows.filter(r => r.status === "pending").length,
    accepted: allRows.filter(r => r.status === "received").length,
    rejected: allRows.filter(r => r.status === "rejected").length,
  };

  const FILTERS = [
    { key: "pending",  label: `Pending (${stats.pending})`,   cls: "act"       },
    { key: "accepted", label: `Accepted (${stats.accepted})`, cls: "act-green" },
    { key: "rejected", label: `Rejected (${stats.rejected})`, cls: "act-red"   },
    { key: "all",      label: `All (${allRows.length})`,       cls: "act"       },
  ];

  return (
    <div>
      {/* Stats — Accepted shown to client = DB status "received" */}
      <div className="cp-stats">
        <div className="cp-stat">
          <div className="cp-stat-num amber">{stats.pending}</div>
          <div className="cp-stat-label">Pending</div>
        </div>
        <div className="cp-stat">
          <div className="cp-stat-num green">{stats.accepted}</div>
          <div className="cp-stat-label">Accepted</div>
        </div>
        <div className="cp-stat">
          <div className="cp-stat-num red">{stats.rejected}</div>
          <div className="cp-stat-label">Rejected</div>
        </div>
      </div>

      {/* Heading */}
      <div className="cp-section-head">
        <div className="cp-section-title">
          Material Requests
          {filter === "pending" && stats.pending > 0 && (
            <span className="cp-count-badge">{stats.pending}</span>
          )}
        </div>
        <button
          onClick={() => { load(); loadStats(); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#888",
            fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center",
            gap: 5, fontFamily: "inherit" }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="cp-filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`cp-chip${filter === f.key ? " " + f.cls : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="cp-loading"><div className="cp-spinner" /> Loading requests…</div>
      ) : !rows.length ? (
        <div className="cp-empty">
          <IcoBox />
          <div className="cp-empty-title">No {filter === "all" ? "" : filter + " "}requests</div>
          <div className="cp-empty-sub">
            {filter === "pending"
              ? "All caught up — no pending approvals."
              : `No ${filter} material requests found.`}
          </div>
        </div>
      ) : (
        rows.map(r => <MaterialCard key={r.id} r={r} onAction={handleAction} />)
      )}

      {/* Toast */}
      {toast && (
        <div className={`cp-toast ${toast.type}`}>
          {toast.type === "ok" ? <IcoCheck /> : <IcoX />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ClientPortal() {
  const [user,         setUser]         = useState(null);
  const [activeSite,   setActiveSite]   = useState("");
  const [allSites,     setAllSites]     = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      const u = JSON.parse(stored);
      setUser(u);

      // Parse site_names (text[] from Postgres may come as string or array)
      const sites = parseSiteNames(u.site_names);

      // Also include site_name (single) if not already in the list
      const primary = (u.site_name || "").trim();
      const combined = primary && !sites.some(s => s.toLowerCase() === primary.toLowerCase())
        ? [primary, ...sites]
        : sites.length ? sites : primary ? [primary] : [];

      setAllSites(combined);
      setActiveSite(combined[0] || "");
    } catch (_) {}
  }, []);

  if (!user) {
    return (
      <>
        <style>{CSS}</style>
        <Navbar />
        <div className="cp-loading" style={{ paddingTop: 80 }}>
          <div className="cp-spinner" /> Loading portal…
        </div>
      </>
    );
  }

  // user_details columns: name, username, role, department, site_name, site_names
  const displayName = user.name || user.username || "Client";
  const displayRole = user.role || user.department || "Client";
  // username column in DB (NOT user_name)
  const displayUsername = user.username || user.user_name || "";

  return (
    <>
      <style>{CSS}</style>
      <Navbar />

      <div className="cp-wrap">
        <div className="cp-inner">

          {/* ── Hero ── */}
          <div className="cp-hero">
            <div className="cp-hero-label">Client Portal</div>
            <div className="cp-hero-name">{displayName}</div>
            <div className="cp-hero-meta">
              <span><IcoUser /> {displayRole}</span>
              {displayUsername && (
                <span style={{ opacity: .55 }}>@{displayUsername}</span>
              )}
            </div>

            {/* Show all assigned sites as badges */}
            {allSites.length > 0 && (
              <div className="cp-hero-badges">
                {allSites.map(s => (
                  <span
                    key={s}
                    className={`cp-hero-site-badge${s === activeSite ? " active-site" : ""}`}
                  >
                    <IcoSite /> {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Multi-site switcher (only if >1 site) ── */}
          {allSites.length > 1 && (
            <div className="cp-site-selector">
              <span className="cp-site-label">Site</span>
              {allSites.map(s => (
                <button
                  key={s}
                  className={`cp-site-chip${activeSite === s ? " act" : ""}`}
                  onClick={() => setActiveSite(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ── Material Requests ── */}
          {activeSite ? (
            <MaterialRequests
              siteName={activeSite}
              userName={displayName}
            />
          ) : (
            <div className="cp-empty" style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e8e4df" }}>
              <IcoBox />
              <div className="cp-empty-title">No site assigned</div>
              <div className="cp-empty-sub">
                Your account isn't linked to a project site yet. Contact your project manager.
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}