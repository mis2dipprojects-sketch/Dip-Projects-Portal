import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { createClient } from "@supabase/supabase-js";
import "./ClientPortal.css";
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

const fmtDateShort = iso => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

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

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || name[0].toUpperCase();
}

// ─── Date grouping for Reports & Photos ──────────────────────────────────────
function groupKey(dateStr, mode) {
  if (!dateStr) return "Undated";
  const d = new Date(dateStr);
  if (mode === "day")   return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  if (mode === "month") return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  if (mode === "year")  return String(d.getFullYear());
  return "Recent";
}

function groupItems(items, mode) {
  if (mode === "recent" || mode === "range") return { Recent: mode === "range" ? items : items.slice(0, 25) };
  const groups = {};
  items.forEach(it => {
    const k = groupKey(it.date, mode);
    if (!groups[k]) groups[k] = [];
    groups[k].push(it);
  });
  return groups;
}



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
const IcoBox = ({ w = 44, h = 44 }) => (
  <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/>
  </svg>
);
const IcoImg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IcoDoc = ({ w = 12, h = 12 }) => (
  <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IcoDl = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IcoEye = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcoHome = ({ w = 16, h = 16 }) => (
  <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
  </svg>
);
const IcoBoxNav = ({ w = 16, h = 16 }) => (
  <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/>
  </svg>
);
const IcoFolder = ({ w = 16, h = 16 }) => (
  <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcoRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IcoArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
// ─── Status config ────────────────────────────────────────────────────────────

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
          {isAccept ? "Accept this request?" : "Reject this request?"}
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
            style={{ background: isAccept ? "#1f7a4d" : "#b3261e", color: "#fff", flex: 1 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Saving…" : (isAccept ? "Yes, Accept" : "Yes, Reject")}
          </button>
          <button
            className="cp-btn"
            style={{ background: "#eef1f5", color: "#5c6b7a", border: "1.5px solid #e1e5eb", flex: 1 }}
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
          {status === "received" && r.actioned_at && (
            <><br />Accepted by <strong>{r.actioned_by || "Client"}</strong> on {fmtDateTime(r.actioned_at)}</>
          )}
          {status === "rejected" && r.actioned_at && (
            <><br />Rejected by <strong>{r.actioned_by || "Client"}</strong> on {fmtDateTime(r.actioned_at)}</>
          )}
        </div>

        {status === "pending" && (
          <div className="cp-mcard-actions">
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



const IcoChevron = ({ open }) => (
  <svg className={`cp-tree-chevron${open ? " open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function buildDateTree(dates) {
  const years = {};
  dates.filter(Boolean).forEach(iso => {
    const d = new Date(iso);
    if (isNaN(d)) return;
    const y = d.getFullYear(), m = d.getMonth();
    const dayKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    years[y] = years[y] || {};
    years[y][m] = years[y][m] || {};
    years[y][m][dayKey] = (years[y][m][dayKey] || 0) + 1;
  });

  return Object.keys(years).map(Number).sort((a, b) => b - a).map(y => ({
    key: `${y}`, label: `${y}`,
    total: Object.values(years[y]).reduce((s, m) => s + Object.values(m).reduce((s2, c) => s2 + c, 0), 0),
    months: Object.keys(years[y]).map(Number).sort((a, b) => b - a).map(m => ({
      key: `${y}-${m}`, label: MONTH_NAMES[m],
      total: Object.values(years[y][m]).reduce((s, c) => s + c, 0),
      days: Object.entries(years[y][m]).sort((a, b) => b[0].localeCompare(a[0])).map(([dayKey, count]) => ({
        key: dayKey, count,
        label: new Date(dayKey).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      })),
    })),
  }));
}

function MediaFolderTree({ siteName, activeDate, onSelectDate }) {
  const [tree, setTree] = useState(null);
  const [openYears, setOpenYears] = useState({});
  const [openMonths, setOpenMonths] = useState({});

  useEffect(() => {
  if (!siteName) return;
  (async () => {
    const [{ data: dprRows }, { data: wprRows }] = await Promise.all([
      supabase.from("dpr_reports").select("id, date, payload").ilike("site", siteName),
      supabase.from("wpr_reports").select("id, report_date").ilike("site_name", siteName),
    ]);
    const wprIds = (wprRows || []).map(w => w.id);

    let imgDates = [];
    if (wprIds.length) {
      const { data } = await supabase
        .from("wpr_images").select("created_at")
        .in("wpr_report_id", wprIds)
        .in("image_type", ["site_photo", "site_photos", "graphical"]);
      imgDates = (data || []).map(r => r.created_at);
    }

    // DPR photos now live in payload.photos, not a separate table
    const dprPhotoDates = (dprRows || []).flatMap(r => {
      const photos = Array.isArray(r?.payload?.photos) ? r.payload.photos : [];
      return photos.length ? photos.map(() => r.date) : [];
    });

    const allDates = [
      ...(dprRows || []).map(r => r.date),
      ...(wprRows || []).map(r => r.report_date),
      ...imgDates,
      ...dprPhotoDates,
    ];
    const t = buildDateTree(allDates);
    setTree(t);
    if (t[0]) {
      setOpenYears({ [t[0].key]: true });
      if (t[0].months[0]) setOpenMonths({ [t[0].months[0].key]: true });
    }
  })();
}, [siteName]);

  if (!tree) return <div className="cp-tree-empty">Loading…</div>;
  if (!tree.length) return <div className="cp-tree-empty">No dated activity yet</div>;

  return (
    <div className="cp-tree">
      {tree.map(y => (
        <div key={y.key}>
          <div className="cp-tree-row" onClick={() => setOpenYears(s => ({ ...s, [y.key]: !s[y.key] }))}>
            <IcoChevron open={!!openYears[y.key]} />
            <span className="cp-tree-label">{y.label}</span>
            <span className="cp-tree-count">{y.total}</span>
          </div>
          {openYears[y.key] && (
            <div className="cp-tree-children">
              {y.months.map(m => (
                <div key={m.key}>
                  <div className="cp-tree-row" onClick={() => setOpenMonths(s => ({ ...s, [m.key]: !s[m.key] }))}>
                    <IcoChevron open={!!openMonths[m.key]} />
                    <span className="cp-tree-label">{m.label}</span>
                    <span className="cp-tree-count">{m.total}</span>
                  </div>
                  {openMonths[m.key] && (
                    <div className="cp-tree-children">
                      {m.days.map(d => (
                        <div
                          key={d.key}
                          className={`cp-tree-row${activeDate === d.key ? " act" : ""}`}
                          onClick={() => onSelectDate(d.key)}
                        >
                          <span className="cp-tree-leaf-dot" />
                          <span className="cp-tree-label">{d.label}</span>
                          <span className="cp-tree-count">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
// ─── Overview / dashboard panel ───────────────────────────────────────────────
function Overview({ siteName, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, accepted: 0, rejected: 0, dpr: 0, wpr: 0, photos: 0 });
  const [recent, setRecent] = useState([]);

  const load = useCallback(async () => {
    if (!siteName) { setLoading(false); return; }
    setLoading(true);

    const { data: matRows } = await supabase
      .from("material_requirements")
      .select("id, status, material_name, quantity, unit_name, created_at, actioned_at")
      .ilike("site_name", siteName)
      .order("created_at", { ascending: false });

    const { count: dprCount } = await supabase
      .from("dpr_reports").select("id", { count: "exact", head: true }).ilike("site", siteName);

    const { data: wprRows } = await supabase
      .from("wpr_reports").select("id").ilike("site_name", siteName);
    const wprIds = (wprRows || []).map(w => w.id);

    let photoCount = 0;
    if (wprIds.length) {
      const { count } = await supabase
        .from("wpr_images").select("id", { count: "exact", head: true }).in("wpr_report_id", wprIds);
      photoCount = count || 0;
    }

    const rows = matRows || [];
    setStats({
      pending:  rows.filter(r => r.status === "pending").length,
      accepted: rows.filter(r => r.status === "received").length,
      rejected: rows.filter(r => r.status === "rejected").length,
      dpr: dprCount || 0,
      wpr: wprIds.length,
      photos: photoCount,
    });
    setRecent(rows.slice(0, 6));
    setLoading(false);
  }, [siteName]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="cp-hero">
        <div>
          <div className="cp-hero-label">Operational snapshot</div>
          <div className="cp-hero-title">Coordinate site decisions with a polished, focused portal.</div>
          <div className="cp-hero-sub">Track procurement approvals, review project documents, and stay aligned with the latest site activity in one place.</div>
        </div>
        <div className="cp-hero-pill">
          <span>{stats.pending}</span>
          <small>pending</small>
        </div>
      </div>

      <div className="cp-stats cols-6">
        <div className="cp-stat"><div className="cp-stat-num amber">{stats.pending}</div><div className="cp-stat-label">Pending</div></div>
        <div className="cp-stat"><div className="cp-stat-num green">{stats.accepted}</div><div className="cp-stat-label">Accepted</div></div>
        <div className="cp-stat"><div className="cp-stat-num red">{stats.rejected}</div><div className="cp-stat-label">Rejected</div></div>
        <div className="cp-stat"><div className="cp-stat-num blue">{stats.dpr}</div><div className="cp-stat-label">Daily Reports</div></div>
        <div className="cp-stat"><div className="cp-stat-num" style={{ color: "var(--accent)" }}>{stats.wpr}</div><div className="cp-stat-label">Weekly Reports</div></div>
        <div className="cp-stat"><div className="cp-stat-num green">{stats.photos}</div><div className="cp-stat-label">Site Photos</div></div>
      </div>

      <div className="cp-quick-grid">
        <button className="cp-quick-card" onClick={() => onNavigate("materials")}>
          <div className="cp-quick-icon"><IcoBoxNav /></div>
          <div className="cp-quick-title">Material Requests</div>
          <div className="cp-quick-sub">Review and action pending procurement requests from site.</div>
          <div className="cp-quick-arrow">Open <IcoArrow /></div>
        </button>
        <button className="cp-quick-card" onClick={() => onNavigate("media")}>
          <div className="cp-quick-icon"><IcoFolder /></div>
          <div className="cp-quick-title">Reports &amp; Photos</div>
          <div className="cp-quick-sub">Browse daily reports, weekly reports and site photos.</div>
          <div className="cp-quick-arrow">Open <IcoArrow /></div>
        </button>
      </div>

      <div className="cp-section-head" style={{ justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--font-display)" }}>Recent Activity</div>
      </div>

      {loading ? (
        <div className="cp-loading"><div className="cp-spinner" /> Loading activity…</div>
      ) : !recent.length ? (
        <div className="cp-empty">
          <IcoBox />
          <div className="cp-empty-title">No activity yet</div>
          <div className="cp-empty-sub">Material requests from the site team will show up here.</div>
        </div>
      ) : (
        <div className="cp-feed">
          {recent.map(r => (
            <div className="cp-feed-row" key={r.id}>
              <div className={`cp-feed-icon ${r.status}`}>
                {r.status === "pending" ? <IcoClock /> : r.status === "received" ? <IcoCheck /> : <IcoX />}
              </div>
              <div className="cp-feed-main">
                <div className="cp-feed-title">{r.material_name} — {r.quantity} {r.unit_name}</div>
                <div className="cp-feed-meta">
                  {r.status === "pending" ? "Awaiting your review" : r.status === "received" ? "Accepted" : "Rejected"}
                </div>
              </div>
              <div className="cp-feed-time">{fmtDateShort(r.actioned_at || r.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Material requests panel ──────────────────────────────────────────────────
function MaterialRequests({ siteName, userName, onStatsChange }) {
  const [rows,    setRows]    = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("pending");
  const [toast,   setToast]   = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

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

  const loadStats = useCallback(async () => {
    if (!siteName) return;
    const { data } = await supabase
      .from("material_requirements")
      .select("status")
      .ilike("site_name", siteName);
    setAllRows(data || []);
    if (onStatsChange) {
      onStatsChange((data || []).filter(r => r.status === "pending").length);
    }
  }, [siteName, onStatsChange]);

  useEffect(() => { load(); loadStats(); }, [load, loadStats]);

  const handleAction = async (id, newStatus, materialName) => {
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
        ? `"${materialName}" accepted.`
        : `"${materialName}" rejected.`
    );
    load();
    loadStats();
  };

  const stats = {
    pending:  allRows.filter(r => r.status === "pending").length,
    accepted: allRows.filter(r => r.status === "received").length,
    rejected: allRows.filter(r => r.status === "rejected").length,
  };

const FILTERS = [
  { key: "pending",  label: `Pending (${stats.pending})`,   cls: "act-amber" },
  { key: "accepted", label: `Accepted (${stats.accepted})`, cls: "act-green" },
  { key: "rejected", label: `Rejected (${stats.rejected})`, cls: "act-red"   },
  { key: "all",      label: `All (${allRows.length})`,      cls: "act"       },
];

  return (
    <div>
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

      <div className="cp-section-head">
        <button
          className="cp-refresh-btn"
          onClick={() => { load(); loadStats(); }}
        >
          <IcoRefresh /> Refresh
        </button>
      </div>

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

      {toast && (
        <div className={`cp-toast ${toast.type}`}>
          {toast.type === "ok" ? <IcoCheck /> : <IcoX />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Reports & Photos panel ────────────────────────────────────────────────
function ReportsAndPhotos({ siteName, jumpDate, onClearJump  }) {
  const [dprs, setDprs]     = useState([]);
  const [wprs, setWprs]     = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode]     = useState("recent"); // recent | day | month | year
  const [typeFilter, setTypeFilter] = useState("all");    // all | dpr | wpr | photo
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [rangeStart, setRangeStart] = useState(""); 
  const [rangeEnd, setRangeEnd]     = useState("");
  const [filterOpen, setFilterOpen] = useState(false);  
  const IcoFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
 useEffect(() => {
    if (jumpDate) setViewMode("day");
  }, [jumpDate]); 

  const load = useCallback(async () => {
  if (!siteName) { setLoading(false); return; }
  setLoading(true);

  const { data: dprData, error: dprErr } = await supabase
    .from("dpr_reports")
    .select("id, site, engineer, report_type, date, pdf_url, created_at, payload")
    .ilike("site", siteName)
    .order("date", { ascending: false });
  if (dprErr) console.error("dpr_reports error:", dprErr);
  setDprs(dprData || []);

  const { data: wprData, error: wprErr } = await supabase
    .from("wpr_reports")
    .select("id, site_name, engineer_name, report_date, report_number, presentation_url, created_at")
    .ilike("site_name", siteName)
    .order("report_date", { ascending: false });
  if (wprErr) console.error("wpr_reports error:", wprErr);
  setWprs(wprData || []);

  const wprIds = (wprData || []).map(w => w.id);

  let wprPhotoRows = [];
  if (wprIds.length) {
    const { data: imgData, error: imgErr } = await supabase
      .from("wpr_images")
      .select("id, wpr_report_id, image_type, public_url, storage_path, caption, created_at")
      .in("wpr_report_id", wprIds)
      .in("image_type", ["site_photo", "site_photos", "graphical"]);
    if (imgErr) console.error("wpr_images error:", imgErr);
    wprPhotoRows = (imgData || []).map(p => ({
      ...p,
      source: "wpr",
      public_url: p.public_url || p.supabaseUrl || null,
    }));
  }

  const dprPhotoRows = (dprData || []).flatMap((report, reportIndex) => {
    const photos = Array.isArray(report?.payload?.photos) ? report.payload.photos : [];
    return photos
      .filter(Boolean)
      .map((photo, photoIndex) => ({
        id: `${report.id}-${photoIndex}`,
        dpr_report_id: report.id,
        public_url: photo.supabaseUrl || photo.publicUrl || photo.url || null,
        storage_path: photo.storagePath || photo.storage_path || null,
        caption: photo.caption || "",
        created_at: report.date || report.created_at,
        source: "dpr",
        image_type: "photos",
      }));
  });

  setPhotos([
    ...wprPhotoRows,
    ...dprPhotoRows,
  ]);

  setLoading(false);
}, [siteName]);

  useEffect(() => { load(); }, [load]);

  const unified = [
  ...dprs.map(r => ({
    type: "dpr", date: r.date || r.created_at, title: `${r.report_type || "Daily"} Report`,
    meta: r.engineer, url: r.pdf_url, kind: "doc",
  })),
  ...wprs.map(r => ({
    type: "wpr", date: r.report_date || r.created_at, title: `Weekly Report #${r.report_number || ""}`,
    meta: r.engineer_name, url: r.presentation_url, kind: "doc",
  })),
  ...photos.map(p => ({
    type: p.image_type === "graphical" ? "graphical" : "photo",
    date: p.created_at,
    title: p.caption || (p.image_type === "graphical" ? "Progress Chart" : "Site Photo"),
    meta: p.image_type === "graphical" ? "Weekly Report" : (p.source === "dpr" ? "Daily Report" : "Weekly Report"),
    url: p.public_url,
    kind: "image",
  })),
].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const dateScoped = jumpDate
  ? unified.filter(it => it.date && it.date.slice(0, 10) === jumpDate)
  : unified;

const counts = {
  all:       dateScoped.length,
  dpr:       dateScoped.filter(it => it.type === "dpr").length,
  wpr:       dateScoped.filter(it => it.type === "wpr").length,
  photo:     dateScoped.filter(it => it.type === "photo").length,
  graphical: dateScoped.filter(it => it.type === "graphical").length,
};

const scoped = dateScoped
  .filter(it => typeFilter === "all" || it.type === typeFilter)
  .filter(it => {
    if (viewMode !== "range") return true;
    if (!it.date) return false;
    const d = it.date.slice(0, 10);
    if (rangeStart && d < rangeStart) return false;
    if (rangeEnd && d > rangeEnd) return false;
    return true;
  });
const grouped = groupItems(scoped, viewMode);
const groupLabels = Object.keys(grouped);

const VIEW_MODES = [
  { key: "recent", label: "Recent" },
  { key: "day",    label: "By Day" },
  { key: "month",  label: "By Month" },
  { key: "year",   label: "By Year" },
  { key: "range",  label: "Date Range" },
];

const TYPE_FILTERS = [
  { key: "all",       label: `All (${counts.all})`,            cls: "type-all"       },
  { key: "dpr",       label: `Daily Reports (${counts.dpr})`,   cls: "type-dpr"       },
  { key: "wpr",       label: `Weekly Reports (${counts.wpr})`,  cls: "type-wpr"       },
  { key: "photo",     label: `Site Photos (${counts.photo})`,   cls: "type-photo"     },
  { key: "graphical", label: `Graphical (${counts.graphical})`, cls: "type-graphical" },
];

  const activeViewLabel = VIEW_MODES.find(v => v.key === viewMode)?.label || "Recent";
  const activeTypeLabel = TYPE_FILTERS.find(f => f.key === typeFilter)?.label || "All";
  return (
  <div>
    {jumpDate && (
      <div className="cp-tree-jump-chip">
        Showing {new Date(jumpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        <button onClick={onClearJump}><IcoX /></button>
      </div>
    )}

    <div className="cp-section-head">
      <button className="cp-refresh-btn" onClick={load}><IcoRefresh /> Refresh</button>
    </div>

<div className="cp-filter-bar">
  <button
    type="button"
    className={`cp-filter-toggle${filterOpen ? " open" : ""}`}
    onClick={() => setFilterOpen(o => !o)}
  >
    <IcoFilter />
    <span className="cp-filter-toggle-text">{activeViewLabel} · {activeTypeLabel}</span>
    <span className="cp-filter-toggle-chevron"><IcoChevron open={filterOpen} /></span>
  </button>

  <div className={`cp-filter-panel${filterOpen ? " open" : ""}`}>
    <div className="cp-viewmodes">
      {VIEW_MODES.map(v => (
        <button
          key={v.key}
          className={`cp-chip${viewMode === v.key ? " act" : ""}`}
          onClick={() => {
            setViewMode(v.key);
            if (jumpDate && onClearJump) onClearJump();
          }}
        >
          {v.label}
        </button>
      ))}
    </div>

    {viewMode === "range" && (
      <div className="cp-range-picker">
        <div className="cp-range-field">
          <label>From</label>
          <input
            type="date"
            value={rangeStart}
            max={rangeEnd || undefined}
            onChange={e => setRangeStart(e.target.value)}
          />
        </div>
        <span className="cp-range-sep">→</span>
        <div className="cp-range-field">
          <label>To</label>
          <input
            type="date"
            value={rangeEnd}
            min={rangeStart || undefined}
            onChange={e => setRangeEnd(e.target.value)}
          />
        </div>
        {(rangeStart || rangeEnd) && (
          <button className="cp-range-clear" onClick={() => { setRangeStart(""); setRangeEnd(""); }}>
            <IcoX /> Clear
          </button>
        )}
      </div>
    )}

    <div className="cp-typefilters">
      {TYPE_FILTERS.map(f => (
        <button
          key={f.key}
          className={`cp-chip${typeFilter === f.key ? " act " + f.cls : ""}`}
          onClick={() => setTypeFilter(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  </div>
</div>

{loading ? (
        <div className="cp-loading"><div className="cp-spinner" /> Loading reports &amp; photos…</div>
      ) : !scoped.length ? (
  <div className="cp-empty">
    <IcoBox />
    <div className="cp-empty-title">
      {viewMode === "range" && (rangeStart || rangeEnd) ? "No results in this range" : "Nothing here yet"}
    </div>
    <div className="cp-empty-sub">
      {viewMode === "range" && (rangeStart || rangeEnd)
        ? "Try widening the date range or clearing a filter."
        : "Daily reports, weekly reports and site photos will appear here once submitted."}
    </div>
  </div>
      ) : (
        groupLabels.map(label => (
          <div key={label}>
            {viewMode !== "recent" && <div className="cp-group-hdr">{label}</div>}
            <div className="cp-media-grid">
              {grouped[label].map((it, i) => (
                <div key={i} className={`cp-media-card type-${it.type}`}>
                  {it.kind === "image" ? (
                    it.url ? (
                      <img className="cp-media-photo" src={it.url} alt="" onClick={() => setLightboxUrl(it.url)} />
                    ) : (
                      <div className="cp-media-photo" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}><IcoImg /></div>
                    )
                  ) : null}
                  <div className="cp-media-body">
                    <span className={`cp-media-badge ${it.type}`}>
                    {it.type === "dpr" ? <IcoDoc /> : it.type === "wpr" ? <IcoDoc /> : <IcoImg />}
                    {it.type === "dpr" ? "Daily Report" : it.type === "wpr" ? "Weekly Report" : it.type === "graphical" ? "Progress Chart" : "Site Photo"}
                  </span>
                    <div className="cp-media-title">{it.title}</div>
                    <div className="cp-media-meta">
                      {it.meta && <span>{it.meta}</span>}
                      {it.meta && <span>·</span>}
                      <IcoClock /> {fmtDateTime(it.date)}
                    </div>
                    {it.kind === "doc" && (
                      it.url ? (
                        <div className="cp-media-actions">
                          <a className="cp-media-link" href={it.url} target="_blank" rel="noopener noreferrer"><IcoEye /> View</a>
                          <a className="cp-media-link dl" href={it.url} download><IcoDl /> Download</a>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: "#bbb", fontStyle: "italic" }}>No file attached</span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {lightboxUrl && (
        <div className="cp-lightbox" onClick={() => setLightboxUrl(null)}>
          <button className="cp-lightbox-close" onClick={() => setLightboxUrl(null)}>✕</button>
          <img src={lightboxUrl} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const SECTIONS = {
  overview:  { title: "Overview",             sub: "A snapshot of activity across your site." },
  materials: { title: "Material Requests",    sub: "Review and action procurement requests from site." },
  media:     { title: "Reports & Photos",     sub: "Daily reports, weekly reports and site photos." },
};

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ClientPortal() {
  const [user,         setUser]         = useState(null);
  const [activeSite,   setActiveSite]   = useState("");
  const [allSites,     setAllSites]     = useState([]);
  const [section,      setSection]      = useState("overview");
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // state additions in ClientPortal
const [jumpDate, setJumpDate] = useState(null);

const handleSelectDate = (dayKey) => {
  setJumpDate(dayKey);
  setSection("media");
};
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      const u = JSON.parse(stored);
      setUser(u);

      const sites = parseSiteNames(u.site_names);
      const primary = (u.site_name || "").trim();
      const combined = primary && !sites.some(s => s.toLowerCase() === primary.toLowerCase())
        ? [primary, ...sites]
        : sites.length ? sites : primary ? [primary] : [];

      setAllSites(combined);
      setActiveSite(combined[0] || "");
    } catch (_) {}
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMobileNavOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="cp-loading" style={{ paddingTop: 80 }}>
          <div className="cp-spinner" /> Loading portal…
        </div>
      </>
    );
  }

  const displayName = user.name || user.username || "Client";
  const displayRole = user.role || user.department || "Client";

  const NAV_ITEMS = [
    { key: "overview",  label: "Overview",          icon: IcoHome },
    { key: "materials", label: "Material Requests",  icon: IcoBoxNav, badge: pendingCount },
    { key: "media",     label: "Reports & Photos",   icon: IcoFolder },
  ];

  return (
    <>
      <Navbar onMenuToggle={() => setMobileNavOpen(v => !v)} menuOpen={mobileNavOpen} />
      <div className="cp-wrap">
        <div className="cp-shell">
          <div className={`cp-menu-backdrop${mobileNavOpen ? " open" : ""}`} onClick={() => setMobileNavOpen(false)} />

          <div className={`cp-mobile-drawer${mobileNavOpen ? " open" : ""}`}>
            <div className="cp-drawer-head">
              <button className="cp-drawer-close" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">✕</button>
            </div>

            <div className="cp-drawer-scroll">
              {allSites.length > 1 && (
                <div className="cp-sidebar-section" style={{ padding: "0 4px 8px" }}>
                  <div className="cp-sidebar-eyebrow">Site</div>
                  <div className="cp-site-list">
                    {allSites.map(s => (
                      <button
                        key={s}
                        className={`cp-site-btn${activeSite === s ? " act" : ""}`}
                        onClick={() => { setActiveSite(s); setMobileNavOpen(false); }}
                      >
                        <span className="cp-site-dot" /> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

<nav className="cp-nav" style={{ padding: "8px 4px 10px" }}>
  {NAV_ITEMS.map(item => {
    const Icon = item.icon;
    return (
      <button
        key={item.key}
        className={`cp-nav-item${section === item.key ? " act" : ""}`}
        onClick={() => { setSection(item.key); setMobileNavOpen(false); }}
      >
        <Icon />
        {item.label}
        {!!item.badge && <span className="cp-nav-badge">{item.badge}</span>}
      </button>
    );
  })}

  {section === "media" && (
    <MediaFolderTree
      siteName={activeSite}
      activeDate={jumpDate}
      onSelectDate={(d) => { handleSelectDate(d); setMobileNavOpen(false); }}
    />
  )}
</nav>
            </div>

            <div className="cp-drawer-footer">
              <div className="cp-user-card">
                <div className="cp-user-avatar">{initials(displayName)}</div>
                <div className="cp-user-meta">
                  <div className="cp-user-name">{displayName}</div>
                  <div className="cp-user-role">{displayRole}</div>
                </div>
              </div>
            </div>
          </div>

          {activeSite && (
            <aside className="cp-sidebar">
              <div className="cp-sidebar-scroll">
                {allSites.length > 1 && (
                  <div className="cp-sidebar-section">
                    <div className="cp-sidebar-eyebrow">Site</div>
                    <div className="cp-site-list">
                      {allSites.map(s => (
                        <button
                          key={s}
                          className={`cp-site-btn${activeSite === s ? " act" : ""}`}
                          onClick={() => setActiveSite(s)}
                        >
                          <span className="cp-site-dot" /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

<nav className="cp-nav">
  {NAV_ITEMS.map(item => {
    const Icon = item.icon;
    return (
      <button
        key={item.key}
        className={`cp-nav-item${section === item.key ? " act" : ""}`}
        onClick={() => setSection(item.key)}
      >
        <Icon />
        {item.label}
        {!!item.badge && <span className="cp-nav-badge">{item.badge}</span>}
      </button>
    );
  })}

  {section === "media" && (
    <MediaFolderTree
      siteName={activeSite}
      activeDate={jumpDate}
      onSelectDate={handleSelectDate}
    />
  )}
</nav>
              </div>

              <div className="cp-sidebar-footer">
                <div className="cp-user-card">
                  <div className="cp-user-avatar">{initials(displayName)}</div>
                  <div className="cp-user-meta">
                    <div className="cp-user-name">{displayName}</div>
                    <div className="cp-user-role">{displayRole}</div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          <main className="cp-main">
            <div className="cp-main-inner">
              {activeSite ? (
                <>
                  <div className="cp-page-header">
                    <div>
                      <div className="cp-page-title">{SECTIONS[section].title}</div>
                      <div className="cp-page-sub">{SECTIONS[section].sub}{allSites.length === 1 ? ` · ${activeSite}` : ""}</div>
                    </div>
                    <div className="cp-page-pill">{activeSite}</div>
                  </div>

                  {section === "overview"  && <Overview siteName={activeSite} onNavigate={setSection} />}
                  {section === "materials" && <MaterialRequests siteName={activeSite} userName={displayName} onStatsChange={setPendingCount} />}
                  {section === "media"     && (<ReportsAndPhotos siteName={activeSite} jumpDate={jumpDate} onClearJump={() => setJumpDate(null)} />)}

                </>
              ) : (
                <div className="cp-nosite-shell">
                  <div className="cp-empty">
                    <IcoBox />
                    <div className="cp-empty-title">No site assigned</div>
                    <div className="cp-empty-sub">Your account isn't linked to a project site yet. Contact your project manager.</div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}