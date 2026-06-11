  import { useEffect, useState, useCallback, useMemo } from "react";
  import Navbar from "../components/Navbar";
  import { supabase } from "../supabase";
  import SiteReport from "./Sitereport";
  import Checklists from "./Checklists";
  // ── Nav Items ──────────────────────────────────────────────────────────────
  const TASK_NAV = [
    {
      key: "my-tasks",
      label: "My Tasks",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg>,
    },
    {
      key: "recurring-tasks",
      label: "Recurring Tasks",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
    },
    {
      key: "delegated-tasks",
      label: "All Delegated Tasks",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      key: "my-reschedules",
      label: "My Reschedule Requests",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
  ];

  const LEAVE_NAV = [
    {
      key: "apply-leave",
      label: "Apply Leave",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>,
    },
    {
      key: "my-leaves",
      label: "My Leaves",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
    },
    {
      key: "proxy-request",
      label: "Proxy Request",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
    },
  ];
  const REPORTS_NAV = [
    {
      key: "site-report",
      label: "Site Report",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="13" y2="17"/>
          <polyline points="9 9 10 9 11 9"/>
        </svg>
      ),
    },
    {
      key: "checklists",
      label: "Checklists",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
  ];
  const LEAVE_TYPES = ["Casual Leave","Sick Leave","Earned Leave","Maternity Leave","Paternity Leave","Compensatory Leave","Unpaid Leave"];

  const PRIORITY_STYLES = {
    high:   { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
    medium: { bg: "#fffbeb", color: "#d97706", dot: "#d97706" },
    low:    { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
  };

  const STATUS_STYLES = {
    pending:     { bg: "#f1f5f9", color: "#64748b" },
    in_progress: { bg: "#eff6ff", color: "#2563eb" },
    completed:   { bg: "#f0fdf4", color: "#16a34a" },
  };

  const EMPTY_FILTERS = { dateFrom: "", dateTo: "", site: "", priority: "", status: "", assignedBy: "" };

  // ── Filter Bar ─────────────────────────────────────────────────────────────
  function TaskFilterBar({ filters, onChange, onClear, taskList, showAssignedBy }) {
    const sitesFiltered    = applyFilters(taskList, { ...filters, site: "" });
    const priorityFiltered = applyFilters(taskList, { ...filters, priority: "" });
    const statusFiltered   = applyFilters(taskList, { ...filters, status: "" });
    const assigneeFiltered = applyFilters(taskList, { ...filters, assignedBy: "" });

    const sites     = useMemo(() => [...new Set(sitesFiltered.map(t => t.site_name).filter(Boolean))].sort(),      [JSON.stringify(sitesFiltered)]);
    const assignees = useMemo(() => [...new Set(assigneeFiltered.map(t => t.assigned_by).filter(Boolean))].sort(), [JSON.stringify(assigneeFiltered)]);
    const priorities = useMemo(() => [...new Set(priorityFiltered.map(t => t.priority).filter(Boolean))].sort(),   [JSON.stringify(priorityFiltered)]);
    const statuses  = useMemo(() => [...new Set(statusFiltered.map(t => t.status).filter(Boolean))].sort(),        [JSON.stringify(statusFiltered)]);
    const isActive   = Object.values(filters).some(v => v !== "");

    return (
      <div className="tf-bar">
        {/* Date range */}
        <div className="tf-group">
          <span className="tf-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Due date
          </span>
          <input className="tf-input tf-date" type="date" value={filters.dateFrom} onChange={e => onChange("dateFrom", e.target.value)} title="From"/>
          <span className="tf-sep-text">–</span>
          <input className="tf-input tf-date" type="date" value={filters.dateTo} min={filters.dateFrom} onChange={e => onChange("dateTo", e.target.value)} title="To"/>
        </div>

        <div className="tf-divider"/>

        {/* Site */}
        {sites.length > 0 && (
          <>
            <div className="tf-group">
              <span className="tf-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <select className="tf-select" value={filters.site} onChange={e => onChange("site", e.target.value)}>
                <option value="">All sites</option>
                {sites.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="tf-divider"/>
          </>
        )}

        {/* Priority */}
        <div className="tf-group">
          <span className="tf-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </span>
          <select className="tf-select" value={filters.priority} onChange={e => onChange("priority", e.target.value)}>
            <option value="">All priorities</option>
            {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </select>
        </div>

        <div className="tf-divider"/>

        {/* Status */}
        <div className="tf-group">
          <span className="tf-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
          </span>
          <select className="tf-select" value={filters.status} onChange={e => onChange("status", e.target.value)}>
            <option value="">All status</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace("_"," ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
          </select>
        </div>

        {/* Given By — only for delegated tab */}
        {showAssignedBy && assignees.length > 0 && (
          <>
            <div className="tf-divider"/>
            <div className="tf-group">
              <span className="tf-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Given by
              </span>
              <select className="tf-select" value={filters.assignedBy} onChange={e => onChange("assignedBy", e.target.value)}>
                <option value="">Anyone</option>
                {assignees.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Clear */}
        {isActive && (
          <button className="tf-clear" onClick={onClear}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Clear filters
          </button>
        )}
      </div>
    );
  }

  function applyFilters(tasks, filters) {
    return tasks.filter(t => {
      if (filters.site     && t.site_name    !== filters.site)     return false;
      if (filters.priority && t.priority     !== filters.priority) return false;
      if (filters.status   && t.status       !== filters.status)   return false;
      if (filters.assignedBy && t.assigned_by !== filters.assignedBy) return false;
      if (filters.dateFrom && t.due_date && t.due_date < filters.dateFrom) return false;
      if (filters.dateTo   && t.due_date && t.due_date > filters.dateTo)   return false;
      return true;
    });
  }

  // ── Leave status helpers ───────────────────────────────────────────────────
  function computeLeaveStatus(leave) {
    if (leave.admin_approved === false || leave.proxy_approved === false) return "rejected";
    const proxyDone = leave.proxy_user_name == null || leave.proxy_approved === true;
    if (leave.admin_approved === true && proxyDone) return "approved";
    return "pending";
  }

  const LEAVE_STATUS_STYLE = {
    pending:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    approved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };

  function LeaveBadge({ leave }) {
    const status = computeLeaveStatus(leave);
    const st = LEAVE_STATUS_STYLE[status];
    const icons = {
      pending:  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
      approved: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
      rejected: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    };
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>
        {icons[status]}{status.charAt(0).toUpperCase()+status.slice(1)}
      </span>
    );
  }

  function ApprovalPips({ leave }) {
    const proxyNeeded = !!leave.proxy_user_name;
    return (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:4 }}>
        <ApprovalPip label="Admin" state={leave.admin_approved} />
        {proxyNeeded && <ApprovalPip label={`Proxy (${leave.proxy_user_name})`} state={leave.proxy_approved} />}
      </div>
    );
  }

  function ApprovalPip({ label, state }) {
    const cfg = state === true  ? { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0", icon:"✓" }
              : state === false ? { bg:"#fef2f2", color:"#dc2626", border:"#fecaca", icon:"✗" }
              :                   { bg:"#f8fafc", color:"#94a3b8", border:"#e2e8f0", icon:"…" };
    return (
      <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:6, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
        {cfg.icon} {label}
      </span>
    );
  }

  // ── TaskCard ───────────────────────────────────────────────────────────────
function TaskCard({ task, onStatusChange, updating, onReschedule, onClick }) {
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const s = STATUS_STYLES[task.status]     || STATUS_STYLES.pending;
  return (
    <div className="op-task-card" onClick={() => onClick?.(task)} style={{cursor:"pointer"}}>
      <div className="op-task-top">
        <div className="op-task-title">{task.title}</div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          {task.audio_url && (
            <span title="Has audio" style={{color:"#7c3aed",display:"flex",alignItems:"center"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
            </span>
          )}
          {task.document_url && (
            <span title="Has document" style={{color:"#2563eb",display:"flex",alignItems:"center"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </span>
          )}
          <span className="op-badge" style={{ background:p.bg, color:p.color }}>
            <span className="op-badge-dot" style={{ background:p.dot }}/>{task.priority}
          </span>
        </div>
      </div>
      {task.description && <p className="op-task-desc">{task.description}</p>}
      <div className="op-task-meta">
        {task.due_date && (
          <span className="op-meta-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {new Date(task.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
          </span>
        )}
        {task.site_name && (
          <span className="op-meta-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {task.site_name}
          </span>
        )}
        {task.assigned_by && (
          <span className="op-meta-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            by {task.assigned_by}
          </span>
        )}
        {task.is_recurring && task.recurrence && (
          <span className="op-meta-pill op-pill-blue">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            {task.recurrence}
          </span>
        )}
        {task.reschedule_allowed && (
          <span className="op-meta-pill" style={{ color:"#7c3aed", background:"#f5f3ff", borderColor:"#e0e7ff" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reschedule enabled
          </span>
        )}
      </div>
      <div className="op-task-footer" onClick={e => e.stopPropagation()}>
        <select
          className="op-status-select"
          style={{ background:s.bg, color:s.color }}
          value={task.status}
          disabled={updating === task.id}
          onChange={e => onStatusChange(task.id, e.target.value, e)}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {updating === task.id && <span className="op-saving">saving…</span>}
        {task.reschedule_allowed && task.status !== "completed" && (
          <button
            className="op-reschedule-btn"
            onClick={e => { e.stopPropagation(); onReschedule(task); }}
            title="Request reschedule"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reschedule
          </button>
        )}
      </div>
    </div>
  );
}

function TaskList({ tasks, loading, onStatusChange, updatingId, emptyText, filters, onFilterChange, onFilterClear, showAssignedBy, allTasks, onReschedule, onDetailClick }) {
  const filtered = applyFilters(tasks, filters);
  const hasActiveFilters = Object.values(filters).some(v => v !== "");
  if (loading) return <div className="op-empty-state"><div className="op-spinner"/><p className="op-empty-text">Loading tasks…</p></div>;
  return (
    <>
      {hasActiveFilters && (
        <p className="tf-count">Showing {filtered.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
      )}
      {filtered.length === 0 ? (
        <div className="op-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/></svg>
          <p className="op-empty-text">{hasActiveFilters ? "No tasks match the current filters." : emptyText}</p>
        </div>
      ) : (
        <div className="op-task-grid">
          {filtered.map(t => (
            <TaskCard
              key={t.id} task={t}
              onStatusChange={onStatusChange}
              updating={updatingId}
              onReschedule={onReschedule}
              onClick={onDetailClick}
            />
          ))}
        </div>
      )}
    </>
  );
}

  // ── Leave Card ─────────────────────────────────────────────────────────────
  function LeaveCard({ leave, showActions, onProxyAction }) {
    const status = computeLeaveStatus(leave);
    const fmt = (d) => d ? new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
    const days = leave.from_date && leave.to_date
      ? Math.ceil((new Date(leave.to_date)-new Date(leave.from_date))/(1000*60*60*24))+1
      : null;
    return (
      <div className="lv-card" style={{ borderLeftColor: status==="approved" ? "#16a34a" : status==="rejected" ? "#dc2626" : "#f59e0b" }}>
        <div className="lv-card-top">
          <div>
            <div className="lv-card-title">{leave.leave_type}</div>
            {leave.user_name && leave.user_name !== leave.name && (
              <div className="lv-card-sub">by {leave.name} ({leave.user_name})</div>
            )}
          </div>
          <LeaveBadge leave={leave}/>
        </div>
        <div className="lv-card-dates">
          <span className="op-meta-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {fmt(leave.from_date)} → {fmt(leave.to_date)}
          </span>
          {days && <span className="op-meta-pill">{days} day{days>1?"s":""}</span>}
          {leave.site_name && <span className="op-meta-pill">{leave.site_name}</span>}
        </div>
        {leave.reason && <p className="lv-reason">"{leave.reason}"</p>}
        {leave.proxy_user_name && (
          <div className="lv-proxy-info">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Proxy: <strong>{leave.proxy_user_name}</strong>
          </div>
        )}
        <ApprovalPips leave={leave}/>
        {leave.rejection_reason && (
          <div className="lv-rejection">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {leave.rejection_reason}
          </div>
        )}
        {showActions && leave.proxy_approved === null && (
          <div className="lv-actions">
            <button className="lv-btn-approve" onClick={()=>onProxyAction(leave.id, true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              Accept Proxy
            </button>
            <button className="lv-btn-reject" onClick={()=>onProxyAction(leave.id, false)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Decline
            </button>
          </div>
        )}
        {showActions && leave.proxy_approved !== null && (
          <div className="lv-already-responded">
            {leave.proxy_approved ? "✓ You accepted this proxy" : "✗ You declined this proxy"}
          </div>
        )}
      </div>
    );
  }

  // ── Main Component ─────────────────────────────────────────────────────────
  export default function OfficePortal() {
    const [rescheduleTask, setRescheduleTask] = useState(null); // task object or null
    const [rescheduleForm, setRescheduleForm] = useState({ requested_date: "", reason: "" });
    const [rescheduleSub, setRescheduleSub]   = useState(false);
    const [myReschedules, setMyReschedules]       = useState([]);
    const [loadingReschedules, setLoadingReschedules] = useState(false);

    const [detailTask, setDetailTask]           = useState(null); // for task detail popup

    const [checklistModal, setChecklistModal] = useState(null);
    const [checkpoints, setCheckpoints]       = useState([]);
    const [checkedItems, setCheckedItems]     = useState({});
    const [fetchingCPs, setFetchingCPs]       = useState(false);

    const [user, setUser]               = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === "undefined" ? true : window.innerWidth > 760);
    const [activeTab, setActiveTab]     = useState("my-tasks");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    // Tasks
    const [myTasks, setMyTasks]               = useState([]);
    const [recurringTasks, setRecurringTasks] = useState([]);
    const [delegatedTasks, setDelegatedTasks] = useState([]);
    const [loadingTasks, setLoadingTasks]     = useState(false);
    const [updatingId, setUpdatingId]         = useState(null);

    // Filters — one set per task tab, reset independently
    const [myTaskFilters,        setMyTaskFilters]        = useState({ ...EMPTY_FILTERS });
    const [recurringFilters,     setRecurringFilters]     = useState({ ...EMPTY_FILTERS });
    const [delegatedFilters,     setDelegatedFilters]     = useState({ ...EMPTY_FILTERS });

    // Leaves
    const [myLeaves, setMyLeaves]           = useState([]);
    const [proxyLeaves, setProxyLeaves]     = useState([]);
    const [loadingLeaves, setLoadingLeaves] = useState(false);  
    const [leaveSubmitting, setLeaveSubmitting] = useState(false);
    const [toast, setToast]                 = useState(null);

    // Leave form
    const [leaveForm, setLeaveForm] = useState({
      leave_type: "", from_date: "", to_date: "", reason: "", proxy_user_name: "",
    });

    useEffect(() => {
      const s = localStorage.getItem("user");
      if (s) setUser(JSON.parse(s));
    }, []);

    const fetchMyReschedules = useCallback(async (u) => {
      if (!u) return;
      setLoadingReschedules(true);
      const { data, error } = await supabase
        .from("reschedule_requests")
        .select("id, task_id, status, reason, requested_date, current_due, admin_note, actioned_by, actioned_at, created_at, employee_read, tasks(title, site_name, due_date)")
        .eq("requested_by", u.user_name)
        .order("created_at", { ascending: false });
    
      if (!error) setMyReschedules(data || []);
      setLoadingReschedules(false);
    }, []);

    const fetchTasks = useCallback(async (u) => {
      if (!u) return;
      setLoadingTasks(true);
      const { data: mine }      = await supabase.from("tasks").select("*").eq("assigned_to",u.user_name).eq("is_recurring",false).order("due_date",{ascending:true});
      const { data: recurring } = await supabase.from("tasks").select("*").eq("assigned_to",u.user_name).eq("is_recurring",true).order("due_date",{ascending:true});
      const { data: delegated } = await supabase.from("tasks").select("*").eq("assigned_by",u.user_name).neq("assigned_to",u.user_name).order("created_at",{ascending:false});
      setMyTasks(mine||[]);
      setRecurringTasks(recurring||[]);
      setDelegatedTasks(delegated||[]);
      setLoadingTasks(false);
    }, []);

    const fetchLeaves = useCallback(async (u) => {
      if (!u) return;
      setLoadingLeaves(true);
      const { data: mine }  = await supabase.from("leaves").select("*").eq("user_name",u.user_name).order("created_at",{ascending:false});
      const { data: proxy } = await supabase.from("leaves").select("*").eq("proxy_user_name",u.user_name).order("created_at",{ascending:false});
      setMyLeaves(mine||[]);
      setProxyLeaves(proxy||[]);
      setLoadingLeaves(false);
    }, []);

    useEffect(() => {
      if (user) {
        fetchTasks(user);
        fetchLeaves(user);
        fetchMyReschedules(user);
      }
    }, [user, fetchTasks, fetchLeaves, fetchMyReschedules]);

    const showToast = (type, msg) => {
      setToast({type,msg});
      setTimeout(()=>setToast(null),3500);
    };

    const handleNavClick = (key) => {
      setActiveTab(key);
      if (typeof window !== "undefined" && window.innerWidth <= 760) setSidebarOpen(false);
    
      // Mark all actioned reschedule requests as read when tab is opened
      if (key === "my-reschedules") {
        markReschedulesRead();
      }
    };

    const handleChecklistConfirm = async () => {
  if (!checkpoints.every(cp => checkedItems[cp.id]))
    return showToast("error", "Please tick all checklist items first.");

  const task = checklistModal;
  const taskId = task.id;
  setChecklistModal(null);
  setUpdatingId(taskId);

  const { error } = await supabase.from("tasks").update({ status: "completed" }).eq("id", taskId);
  if (!error) {
    const patch = list => list.map(t => t.id === taskId ? { ...t, status: "completed" } : t);
    setMyTasks(p => patch(p));
    setRecurringTasks(p => patch(p));
    setDelegatedTasks(p => patch(p));

    // Spawn next recurring instance if applicable
    if (task?.is_recurring) {
      const nextDue = getNextDueDate(task.due_date, task.recurrence);
      const { data: newTask, error: insertErr } = await supabase.from("tasks").insert([{
        title:              task.title,
        description:        task.description        || null,
        assigned_to:        task.assigned_to,
        assigned_by:        task.assigned_by         || null,
        site_name:          task.site_name           || null,
        priority:           task.priority            || "medium",
        status:             "pending",
        is_recurring:       true,
        recurrence:         task.recurrence,
        due_date:           nextDue,
        audio_url:          task.audio_url           || null,
        document_url:       task.document_url        || null,
        has_checkpoints:    task.has_checkpoints     || false,
        reschedule_allowed: task.reschedule_allowed  || false,
      }]).select().single();

      if (!insertErr && newTask) {
        setRecurringTasks(p => [...p, newTask]);
        showToast("success", `Completed! Next instance due ${new Date(nextDue + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}.`);
      } else {
        showToast("success", "Task marked as completed!");
      }
    } else {
      showToast("success", "Task marked as completed!");
    }
  } else {
    showToast("error", "Failed: " + error.message);
  }
  setUpdatingId(null);
};
    const getNextDueDate = (currentDue, recurrence) => {
  const base = currentDue ? new Date(currentDue + "T00:00:00") : new Date();
  switch ((recurrence || "").toLowerCase()) {
    case "daily":   base.setDate(base.getDate() + 1);   break;
    case "weekly":  base.setDate(base.getDate() + 7);   break;
    case "monthly": base.setMonth(base.getMonth() + 1); break;
    default:        base.setDate(base.getDate() + 1);
  }
  return base.toISOString().split("T")[0];
};

const handleStatusChange = async (taskId, newStatus, e) => {
  e?.stopPropagation();
  const task = [...myTasks, ...recurringTasks, ...delegatedTasks].find(t => t.id === taskId);

  // Checklist gate
  if (newStatus === "completed" && task?.has_checkpoints) {
    setFetchingCPs(true);
    const { data } = await supabase
      .from("checkpoints")
      .select("id, checkpoint")
      .eq("task_type", task.title);
    setCheckpoints(data || []);
    setCheckedItems({});
    setChecklistModal(task);
    setFetchingCPs(false);
    return;
  }

  setUpdatingId(taskId);
  const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);

  if (!error) {
    const patch = list => list.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setMyTasks(p => patch(p));
    setRecurringTasks(p => patch(p));
    setDelegatedTasks(p => patch(p));

    // ── If a recurring task is completed, spawn the next instance ──
    if (newStatus === "completed" && task?.is_recurring) {
      const nextDue = getNextDueDate(task.due_date, task.recurrence);
      const { data: newTask, error: insertErr } = await supabase.from("tasks").insert([{
        title:             task.title,
        description:       task.description       || null,
        assigned_to:       task.assigned_to,
        assigned_by:       task.assigned_by        || null,
        site_name:         task.site_name          || null,
        priority:          task.priority           || "medium",
        status:            "pending",
        is_recurring:      true,
        recurrence:        task.recurrence,
        due_date:          nextDue,
        audio_url:         task.audio_url          || null,  // ← copies audio
        document_url:      task.document_url       || null,  // ← copies doc
        has_checkpoints:   task.has_checkpoints    || false,
        reschedule_allowed: task.reschedule_allowed || false,
      }]).select().single();

      if (!insertErr && newTask) {
        setRecurringTasks(p => [...p, newTask]);
        showToast("success", `Task completed! Next instance created for ${new Date(nextDue + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}.`);
      } else {
        showToast("success", "Task marked complete.");
        if (insertErr) console.error("Failed to spawn next instance:", insertErr.message);
      }
    }
  }
  setUpdatingId(null);
};

    const markReschedulesRead = async () => {
      const unreadIds = myReschedules
        .filter(r =>
          (r.status === "approved" || r.status === "rejected") &&
          r.employee_read !== true   // catches both false AND null
        )
        .map(r => r.id);
    
      if (!unreadIds.length) return;
    
      const { error } = await supabase
        .from("reschedule_requests")
        .update({ employee_read: true })
        .in("id", unreadIds);
    
      if (!error) {
        setMyReschedules(prev =>
          prev.map(r =>
            unreadIds.includes(r.id) ? { ...r, employee_read: true } : r
          )
        );
      }
    };

    const handleRescheduleSubmit = async () => {
      if (!rescheduleForm.requested_date) return showToast("error", "Please select a new date.");
      if (!rescheduleForm.reason.trim())  return showToast("error", "Please provide a reason.");
      if (rescheduleTask.due_date && rescheduleForm.requested_date <= rescheduleTask.due_date)
        return showToast("error", "Requested date must be after the current due date.");
    
      setRescheduleSub(true);
      const { error } = await supabase.from("reschedule_requests").insert([{
        task_id:        rescheduleTask.id,
        requested_by:   user.user_name,
        assigned_by:    rescheduleTask.assigned_by,
        current_due:    rescheduleTask.due_date || null,
        requested_date: rescheduleForm.requested_date,
        reason:         rescheduleForm.reason.trim(),
        status:         "pending",
      }]);
      setRescheduleSub(false);
    
      if (error) {
        showToast("error", "Failed to submit reschedule: " + error.message);
      } else {
        showToast("success", "Reschedule request submitted!");
        setRescheduleTask(null);
        setRescheduleForm({ requested_date: "", reason: "" });
      }
    };
    const handleLeaveSubmit = async () => {
      if (!leaveForm.leave_type)  return showToast("error","Please select a leave type.");
      if (!leaveForm.from_date)   return showToast("error","Please select a start date.");
      if (!leaveForm.to_date)     return showToast("error","Please select an end date.");
      if (new Date(leaveForm.to_date) < new Date(leaveForm.from_date))
        return showToast("error","End date must be after start date.");
      if (leaveForm.proxy_user_name && leaveForm.proxy_user_name.trim() === user.user_name)
        return showToast("error","You cannot assign yourself as proxy.");

      setLeaveSubmitting(true);
      const payload = {
        user_name:       user.user_name,
        name:            user.name,
        site_name:       user.site_name || null,
        leave_type:      leaveForm.leave_type,
        from_date:       leaveForm.from_date,
        to_date:         leaveForm.to_date,
        reason:          leaveForm.reason.trim() || null,
        proxy_user_name: leaveForm.proxy_user_name.trim() || null,
        status:          "pending",
        admin_approved:  null,
        proxy_approved:  null,
      };
      const { error } = await supabase.from("leaves").insert([payload]);
      setLeaveSubmitting(false);
      if (error) {
        showToast("error","Failed to submit leave. "+error.message);
      } else {
        showToast("success","Leave application submitted successfully!");
        setLeaveForm({ leave_type:"", from_date:"", to_date:"", reason:"", proxy_user_name:"" });
        fetchLeaves(user);
        setActiveTab("my-leaves");
      }
    };

    const handleProxyAction = async (leaveId, approved) => {
      const { error } = await supabase.from("leaves").update({ proxy_approved: approved }).eq("id",leaveId);
      if (!error) {
        setProxyLeaves(p=>p.map(l=>l.id===leaveId?{...l,proxy_approved:approved}:l));
        showToast("success", approved ? "You accepted the proxy role." : "You declined the proxy request.");
      } else {
        showToast("error","Action failed. "+error.message);
      }
    };

    if (!user) return <h2 style={{textAlign:"center",marginTop:80,color:"#94a3b8"}}>Loading…</h2>;

    const delegatedMixed = [
      ...delegatedTasks,
      ...myTasks.filter(t=>!delegatedTasks.some(d=>d.id===t.id)),
      ...recurringTasks.filter(t=>!delegatedTasks.some(d=>d.id===t.id)),
    ].sort((a,b)=>new Date(a.due_date||a.created_at||0)-new Date(b.due_date||b.created_at||0));

    const activeItem = [...TASK_NAV,...LEAVE_NAV,...REPORTS_NAV].find(n=>n.key===activeTab);
    const proxyPendingCount = proxyLeaves.filter(l=>l.proxy_approved===null).length;
    const unreadReschedules = myReschedules.filter(r => (r.status==="approved" || r.status==="rejected") && r.employee_read !== true).length;
 
 
    // Filter change helpers
    const makeFilterChange = (setter) => (key, val) => setter(prev => ({...prev, [key]: val}));
    const makeFilterClear  = (setter) => () => setter({ ...EMPTY_FILTERS });

    const renderContent = () => {
      switch (activeTab) {
        case "my-tasks":
          return <TaskList
            tasks={myTasks} loading={loadingTasks}
            onStatusChange={handleStatusChange} updatingId={updatingId}
            emptyText="No tasks assigned to you yet."
            filters={myTaskFilters}
            onFilterChange={makeFilterChange(setMyTaskFilters)}
            onFilterClear={makeFilterClear(setMyTaskFilters)}
            showAssignedBy={false}
            allTasks={myTasks}
            onReschedule={(task) => { setRescheduleTask(task); setRescheduleForm({ requested_date: "", reason: "" }); }}
            onDetailClick={(task) => setDetailTask(task)}
          />;

        case "recurring-tasks":
          return <TaskList
            tasks={recurringTasks} loading={loadingTasks}
            onStatusChange={handleStatusChange} updatingId={updatingId}
            emptyText="No recurring tasks assigned to you."
            filters={recurringFilters}
            onFilterChange={makeFilterChange(setRecurringFilters)}
            onFilterClear={makeFilterClear(setRecurringFilters)}
            showAssignedBy={false}
            allTasks={recurringTasks}
            onReschedule={(task) => { setRescheduleTask(task); setRescheduleForm({ requested_date: "", reason: "" }); }}
            onDetailClick={(task) => setDetailTask(task)}
          />;

        case "delegated-tasks":
          return <TaskList
            tasks={delegatedMixed} loading={loadingTasks}
            onStatusChange={handleStatusChange} updatingId={updatingId}
            emptyText="You haven't delegated any tasks yet."
            filters={delegatedFilters}
            onFilterChange={makeFilterChange(setDelegatedFilters)}
            onFilterClear={makeFilterClear(setDelegatedFilters)}
            showAssignedBy={true}
            allTasks={delegatedMixed}
            onReschedule={(task) => { setRescheduleTask(task); setRescheduleForm({ requested_date: "", reason: "" }); }}
            onDetailClick={(task) => setDetailTask(task)}
          />;

        case "apply-leave":
          return (
            <div className="lv-form-wrap">
              <div className="lv-form-info">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Your leave application will be reviewed by <strong>Admin</strong>. If you assign a proxy, their approval is also required before the leave is granted.
              </div>
              <div className="lv-form-grid">
                <div className="lv-field lv-col-2">
                  <label className="lv-label">Leave Type <span className="lv-req">*</span></label>
                  <select className="lv-input lv-select" value={leaveForm.leave_type} onChange={e=>setLeaveForm(p=>({...p,leave_type:e.target.value}))}>
                    <option value="">Select leave type…</option>
                    {LEAVE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="lv-field">
                  <label className="lv-label">From Date <span className="lv-req">*</span></label>
                  <input className="lv-input" type="date" value={leaveForm.from_date} onChange={e=>setLeaveForm(p=>({...p,from_date:e.target.value}))} min={new Date().toISOString().slice(0,10)}/>
                </div>
                <div className="lv-field">
                  <label className="lv-label">To Date <span className="lv-req">*</span></label>
                  <input className="lv-input" type="date" value={leaveForm.to_date} onChange={e=>setLeaveForm(p=>({...p,to_date:e.target.value}))} min={leaveForm.from_date||new Date().toISOString().slice(0,10)}/>
                </div>
                {leaveForm.from_date && leaveForm.to_date && new Date(leaveForm.to_date)>=new Date(leaveForm.from_date) && (
                  <div className="lv-duration-preview lv-col-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {Math.ceil((new Date(leaveForm.to_date)-new Date(leaveForm.from_date))/(1000*60*60*24))+1} day(s) of leave
                  </div>
                )}
                <div className="lv-field lv-col-2">
                  <label className="lv-label">Reason</label>
                  <textarea className="lv-input lv-textarea" rows={3} placeholder="Briefly describe the reason for your leave…" value={leaveForm.reason} onChange={e=>setLeaveForm(p=>({...p,reason:e.target.value}))}/>
                </div>
                <div className="lv-field lv-col-2">
                  <label className="lv-label">Proxy Username <span className="lv-optional">optional</span></label>
                  <input className="lv-input" placeholder="Enter colleague's username to act as proxy…" value={leaveForm.proxy_user_name} onChange={e=>setLeaveForm(p=>({...p,proxy_user_name:e.target.value}))}/>
                  <span className="lv-hint">If assigned, both admin and proxy must approve your leave.</span>
                </div>
                <div className="lv-field lv-col-2 lv-actions-row">
                  <button className="lv-btn-reset" onClick={()=>setLeaveForm({leave_type:"",from_date:"",to_date:"",reason:"",proxy_user_name:""})}>Reset</button>
                  <button className="lv-btn-submit" onClick={handleLeaveSubmit} disabled={leaveSubmitting}>
                    {leaveSubmitting
                      ? <><span className="op-mini-spinner"/>&nbsp;Submitting…</>
                      : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>&nbsp;Submit Application</>
                    }
                  </button>
                </div>
              </div>
            </div>
            
          );

        case "my-leaves":
          if (loadingLeaves) return <div className="op-empty-state"><div className="op-spinner"/><p className="op-empty-text">Loading…</p></div>;
          if (!myLeaves.length) return (
            <div className="op-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p className="op-empty-text">You haven't applied for any leave yet.</p>
              <button className="lv-btn-submit" style={{marginTop:4}} onClick={()=>setActiveTab("apply-leave")}>Apply Now</button>
            </div>
          );
          return <div className="lv-cards-grid">{myLeaves.map(l=><LeaveCard key={l.id} leave={l} showActions={false}/>)}</div>;

        case "proxy-request":
          if (loadingLeaves) return <div className="op-empty-state"><div className="op-spinner"/><p className="op-empty-text">Loading…</p></div>;
          if (!proxyLeaves.length) return (
            <div className="op-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <p className="op-empty-text">No one has assigned you as a proxy yet.</p>
            </div>
          );
          return <div className="lv-cards-grid">{proxyLeaves.map(l=><LeaveCard key={l.id} leave={l} showActions={true} onProxyAction={handleProxyAction}/>)}</div>;
          
            case "site-report":
              return <SiteReport user={user} />;

            case "checklists":
              return <Checklists user={user} />;

        case "my-reschedules":
          if (loadingReschedules) return (
            <div className="op-empty-state">
              <div className="op-spinner"/>
              <p className="op-empty-text">Loading…</p>
            </div>
          );
          if (!myReschedules.length) return (
            <div className="op-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.3 }}>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
              <p className="op-empty-text">You haven't submitted any reschedule requests yet.</p>
            </div>
          );
          return (
            <div className="lv-cards-grid">
              {myReschedules.map(req => {
                const isPending  = req.status === "pending";
                const isApproved = req.status === "approved";
                const isRejected = req.status === "rejected";
                const isUnread = req.employee_read !== true && (isApproved || isRejected);
        
                const statusColors = {
                  pending:  { bg:"#fffbeb", color:"#d97706", border:"#fde68a", leftBorder:"#f59e0b" },
                  approved: { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0", leftBorder:"#16a34a" },
                  rejected: { bg:"#fef2f2", color:"#dc2626", border:"#fecaca", leftBorder:"#dc2626" },
                };
                const sc = statusColors[req.status] || statusColors.pending;
        
                const fmtDate = d => d
                  ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
                  : "—";
        
                return (
                  <div
                    key={req.id}
                    className="lv-card"
                    style={{
                      borderLeftColor: sc.leftBorder,
                      // Subtle highlight for unread actioned cards
                      background: isUnread ? "#fafafa" : "#fff",
                      boxShadow: isUnread ? "0 0 0 2px #e0e7ff" : undefined,
                    }}
                  >
                    {/* ── Top: task name + status badge ── */}
                    <div className="lv-card-top">
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <div className="lv-card-title">
                            {req.tasks?.title || `Task #${req.task_id}`}
                          </div>
                          {/* NEW badge for unread decisions */}
                          {isUnread && (
                            <span style={{
                              fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20,
                              background:"#7c3aed", color:"#fff", letterSpacing:".04em",
                              flexShrink:0,
                            }}>
                              NEW
                            </span>
                          )}
                        </div>
                        {req.tasks?.site_name && (
                          <div className="lv-card-sub">{req.tasks.site_name}</div>
                        )}
                      </div>
        
                      {/* Status badge */}
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:5, flexShrink:0,
                        fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20,
                        background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`,
                      }}>
                        {isPending  && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                        {isApproved && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                        {isRejected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
        
                    {/* ── Pending state: "awaiting admin review" banner ── */}
                    {isPending && (
                      <div style={{
                        display:"flex", alignItems:"center", gap:8,
                        background:"#fffbeb", border:"1px solid #fde68a",
                        borderRadius:8, padding:"10px 12px",
                        fontSize:12.5, color:"#92400e", lineHeight:1.5,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                        <span>
                          <strong>Pending admin approval</strong> — your request has been submitted and is awaiting review.
                        </span>
                      </div>
                    )}
        
                    {/* ── Approved state: confirmation banner ── */}
                    {isApproved && (
                      <div style={{
                        display:"flex", alignItems:"center", gap:8,
                        background:"#f0fdf4", border:"1px solid #bbf7d0",
                        borderRadius:8, padding:"10px 12px",
                        fontSize:12.5, color:"#166534", lineHeight:1.5,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span>
                          <strong>Approved!</strong> Your task due date has been updated to{" "}
                          <strong>{fmtDate(req.requested_date)}</strong>.
                        </span>
                      </div>
                    )}
        
                    {/* ── Rejected state: rejection banner ── */}
                    {isRejected && (
                      <div style={{
                        display:"flex", alignItems:"flex-start", gap:8,
                        background:"#fef2f2", border:"1px solid #fecaca",
                        borderRadius:8, padding:"10px 12px",
                        fontSize:12.5, color:"#991b1b", lineHeight:1.5,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>
                          <strong>Rejected.</strong>{" "}
                          {req.admin_note ? `Reason: ${req.admin_note}` : "Your reschedule request was not approved."}
                        </span>
                      </div>
                    )}
        
                    {/* ── Date pills ── */}
                    <div className="lv-card-dates">
                      <span className="op-meta-pill">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Current due: {fmtDate(req.current_due)}
                      </span>
                      <span className="op-meta-pill" style={{ color:"#7c3aed", background:"#f5f3ff", borderColor:"#e0e7ff" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        Requested: {fmtDate(req.requested_date)}
                      </span>
                    </div>
        
                    {/* ── Reason ── */}
                    {req.reason && (
                      <p className="lv-reason">"{req.reason}"</p>
                    )}
        
                    {/* ── Actioned by / submitted on ── */}
                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                      {req.actioned_by && (
                        <div style={{ fontSize:11.5, color:"#94a3b8", display:"flex", alignItems:"center", gap:5 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {isApproved ? "Approved" : "Rejected"} by {req.actioned_by}
                          {req.actioned_at && ` · ${new Date(req.actioned_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}`}
                        </div>
                      )}
                      <div style={{ fontSize:11, color:"#cbd5e1" }}>
                        Submitted {new Date(req.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
 
        default: return null;
      }
    };

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .op-root { font-family: 'DM Sans', sans-serif; background: #f4f6f9; min-height: 100vh; color: #1e293b; }
          .op-body { display: flex; min-height: calc(100vh - 60px); background: #c9d0d4d0; }

          /* ── Filter Bar ── */
          .tf-bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 14px; background: #c9d0d4d0; border: 1px solid #e8edf3; border-radius: 10px; margin-bottom: 16px; position: fixed; top: 120px; right:50px;z-index: 10; }
          .tf-group { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; }
          .tf-label { font-size: 12px; font-weight: 600; color: #64748b; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
          .tf-input { font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #1e293b; background: #fff; border: 1px solid #c9d0d4d0; border-radius: 6px; padding: 5px 9px; height: 32px; outline: none; transition: border .15s; }
          .tf-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.08); }
          .tf-date { width: 140px; cursor: pointer; }
          .tf-select { font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #1e293b; background: #fff; border: 1px solid #c9d0d4d0; border-radius: 6px; padding: 5px 9px; height: 32px; cursor: pointer; outline: none; transition: border .15s; }
          .tf-select:focus { border-color: #2563eb; }
          .tf-sep-text { font-size: 12px; color: #94a3b8; }
          .tf-divider { width: 1px; height: 20px; background: #c9d0d4d0; flex-shrink: 0; }
          .tf-clear { display: inline-flex; align-items: center; gap: 5px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 5px 11px; height: 32px; cursor: pointer; white-space: nowrap; transition: background .15s; margin-left: auto; }
          .tf-clear:hover { background: #fee2e2; }
          .tf-count { font-size: 12px; color: #64748b; margin-bottom: 12px; margin-top: -6px; }

          /* ── Sidebar ── */
          .op-sidebar { width: 240px; min-width: 240px; background: #fff; border-right: 1px solid #e8edf3; display: flex; flex-direction: column; transition: width .25s cubic-bezier(.4,0,.2,1), min-width .25s, opacity .2s; overflow: hidden; box-shadow: 2px 0 12px rgba(0,0,0,.04); position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; }
          .op-sidebar.collapsed { width: 0; min-width: 0; opacity: 0; pointer-events: none; }
          .op-sidebar-header { padding: 20px 20px 12px; border-bottom: 1px solid #f0f4f8; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
          
          .op-sidebar-close { display: none; width: 32px; height: 32px; border-radius: 8px; border: 1px solid #c9d0d4d0; background: #fff; color: #64748b; cursor: pointer; align-items: center; justify-content: center; }
          .op-sidebar-backdrop { display: none; }
          .op-nav { padding: 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
          .op-nav-section { font-size: 10px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: #000000; padding: 12px 12px 4px; }
          .op-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: #64748b; font-size: 13.5px; font-weight: 500; white-space: nowrap; border: none; background: transparent; width: 100%; text-align: left; transition: background .15s, color .15s; position: relative; }
          .op-nav-item:hover  { background: #f1f5f9; color: #1e293b; }
          .op-nav-item.active { background: #eff6ff; color: #2563eb; }
          .op-nav-item.active svg { stroke: #2563eb; }
          .op-nav-icon { flex-shrink: 0; display: flex; align-items: center; }
          .op-nav-badge { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: #dc2626; color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

          /* ── Main ── */
          .op-main { flex: 1; padding: 28px 32px; overflow: auto; }
          .op-toggle-btn {  width: 36px; height: 36px; border-radius: 8px; border: 1px solid #c9d0d4d0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; transition: background .15s; flex-shrink: 0; }
          .op-toggle-btn:hover { background: #f1f5f9; }
          .op-page-title { font-size: 18px; font-weight: 600; color: #1e293b; }

          /* ── Profile Card ── */
          .op-profile-card { background: #fff; border-radius: 14px; padding: 24px 28px;   border-bottom: 4px solid transparent;border-right: 4px solid transparent;background:linear-gradient(white, white) padding-box,linear-gradient(135deg,#3d1200 0%,#7a2e00 50%,#c96a10 100%) border-box;
          box-shadow: 0 4px 20px rgba(37,99,235,.08); margin-bottom: 28px; display: flex; align-items: center; gap: 20px; }
          .op-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg,#dbeafe,#bfdbfe); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: #2563eb; flex-shrink: 0; font-family: 'DM Mono', monospace; }
          .op-profile-info { display: flex; flex-direction: column; gap: 4px; }
          .op-profile-name { font-size: 17px; font-weight: 600; color: #1e293b; }
          .op-profile-meta { display: flex; gap: 16px; flex-wrap: wrap; }
          .op-meta-chip { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 5px; }
          .op-meta-chip strong { color: #334155; }

          /* ── Content Card ── */
          .op-content-card { background: #fff; border-radius: 14px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,.05); min-height: 300px; }
          .op-content-header {display: flex; align-items: center; gap: 10px;margin-bottom: 20px; padding-bottom: 16px;border-bottom: 1px solid #f1f5f9;flex-wrap: wrap;}
          .op-content-icon  { width: 36px; height: 36px; border-radius: 8px; background: #eff6ff; display: flex; align-items: center; justify-content: center; color: #2563eb; }
          .op-content-title { font-size: 15px; font-weight: 600; color: #1e293b; }

          /* ── Task cards ── */
          .op-task-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 16px; }
          .op-task-card {
              background: #fff;
              border: 1px solid #e8edf3;
              border-radius: 12px;
              padding: 18px;
              display: flex;
              flex-direction: column;
              gap: 10px;
              transition: box-shadow .15s;
              box-shadow: 0 0px 20px rgb(185, 189, 192);
          }
          .op-task-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
          .op-task-top   { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
          .op-task-title { font-size: 14px; font-weight: 600; color: #1e293b; line-height: 1.4; }
          .op-task-desc  { font-size: 13px; color: #64748b; line-height: 1.5; }
          .op-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; text-transform: capitalize; flex-shrink: 0; }
          .op-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
          .op-task-meta  { display: flex; flex-wrap: wrap; gap: 6px; }
          .op-meta-pill  { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; color: #64748b; background: #f8fafc; border: 1px solid #e8edf3; border-radius: 6px; padding: 3px 8px; }
          .op-pill-blue  { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
          .op-task-footer { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
          .op-status-select { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; border: none; cursor: pointer; outline: none; }
          .op-saving { font-size: 11px; color: #94a3b8; }

          /* ── Leave Form ── */
          .lv-form-wrap { display: flex; flex-direction: column; gap: 18px; }
          .lv-form-info { display: flex; align-items: flex-start; gap: 9px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 13px 16px; font-size: 13px; color: #2563eb; line-height: 1.5; }
          .lv-form-info svg { flex-shrink: 0; margin-top: 1px; }
          .lv-form-info strong { color: #1d4ed8; }
          .lv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .lv-field { display: flex; flex-direction: column; gap: 6px; }
          .lv-col-2 { grid-column: span 2; }
          @media (max-width: 620px) { .lv-form-grid { grid-template-columns: 1fr; } .lv-col-2 { grid-column: span 1; } }
          .lv-label    { font-size: 12.5px; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 6px; }
          .lv-req      { color: #dc2626; }
          .lv-optional { font-size: 11px; font-weight: 500; color: #94a3b8; background: #f1f5f9; border-radius: 4px; padding: 1px 6px; }
          .lv-hint     { font-size: 11.5px; color: #94a3b8; margin-top: -2px; }
          .lv-input    { font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1e293b; background: #f8fafc; border: 1px solid #c9d0d4d0; border-radius: 8px; padding: 9px 12px; outline: none; transition: border .15s, box-shadow .15s; width: 100%; }
          .lv-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); background: #fff; }
          .lv-select  { cursor: pointer; }
          .lv-textarea { resize: vertical; min-height: 80px; }
          .lv-duration-preview { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #16a34a; }
          .lv-actions-row { flex-direction: row; justify-content: flex-end; align-items: center; gap: 10px; padding-top: 4px; }
          .lv-btn-submit { display: inline-flex; align-items: center; gap: 7px; background: #2563eb; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; transition: background .15s; }
          .lv-btn-submit:hover:not(:disabled)  { background: #1d4ed8; }
          .lv-btn-submit:disabled { opacity: .6; cursor: not-allowed; }
          .lv-btn-reset  { display: inline-flex; align-items: center; gap: 7px; background: #f1f5f9; color: #475569; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; padding: 10px 18px; border-radius: 8px; border: 1px solid #c9d0d4d0; cursor: pointer; transition: background .15s; }
          .lv-btn-reset:hover { background: #c9d0d4d0; }

          /* ── Leave Cards ── */
          .lv-cards-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 16px; }
          .lv-card { background: #fff; border: 1px solid #e8edf3; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow .15s; }
          .lv-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
          .lv-card-top   { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
          .lv-card-title { font-size: 14px; font-weight: 700; color: #1e293b; }
          .lv-card-sub   { font-size: 12px; color: #94a3b8; margin-top: 2px; }
          .lv-card-dates { display: flex; flex-wrap: wrap; gap: 6px; }
          .lv-reason { font-size: 12.5px; color: #64748b; font-style: italic; line-height: 1.5; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #c9d0d4d0; }
          .lv-proxy-info { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6366f1; background: #f5f3ff; border: 1px solid #e0e7ff; border-radius: 6px; padding: 5px 10px; font-weight: 500; }
          .lv-rejection  { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 7px 10px; line-height: 1.4; }
          .lv-actions    { display: flex; gap: 8px; margin-top: 4px; }
          .lv-btn-approve { display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; padding: 7px 14px; border-radius: 7px; cursor: pointer; transition: background .15s; }
          .lv-btn-approve:hover { background: #dcfce7; }
          .lv-btn-reject  { display: inline-flex; align-items: center; gap: 6px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; padding: 7px 14px; border-radius: 7px; cursor: pointer; transition: background .15s; }
          .lv-btn-reject:hover { background: #fee2e2; }
          .lv-already-responded { font-size: 12px; color: #64748b; font-style: italic; margin-top: 2px; }

          /* ── Shared ── */
          .op-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; color: #94a3b8; gap: 12px; text-align: center; }
          .op-empty-text  { font-size: 13.5px; }
          .op-spinner { width: 32px; height: 32px; border: 3px solid #c9d0d4d0; border-top-color: #2563eb; border-radius: 50%; animation: spin .7s linear infinite; }
          .op-mini-spinner { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }

          /* ── Toast ── */
          .op-toast { position: fixed; bottom: 28px; right: 28px; z-index: 9999; display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,.15); animation: slideUp .25s ease; }
          .op-toast-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
          .op-toast-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
          @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

          @media (max-width: 900px) {
            .op-main { padding: 22px 22px 28px; }
            .op-content-card { padding: 22px; border-radius: 12px; }
            .op-profile-card { padding: 20px 22px; align-items: flex-start; }
            .op-task-grid, .lv-cards-grid { grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 14px; }
            .tf-date { width: 120px; }
          }

          @media (max-width: 760px) {
            .op-body { display: block; }
            .op-sidebar { position: fixed; top: 0; left: 0; z-index: 10020; height: 100vh; width: min(84vw, 300px); min-width: 0; border-right: 1px solid #e8edf3; transform: translateX(0); opacity: 1; box-shadow: 12px 0 34px rgba(15,23,42,.18); transition: transform .22s ease, opacity .18s ease; }
            .op-sidebar.collapsed { width: min(84vw, 300px); min-width: 0; transform: translateX(-105%); opacity: 0; pointer-events: none; }
            .op-sidebar-close { display: inline-flex; }
            .op-sidebar-backdrop { display: block; position: fixed; inset: 0; z-index: 10010; background: rgba(15,23,42,.38); backdrop-filter: blur(2px); border: none; padding: 0; }
            .op-main { padding: 16px 14px 24px; overflow: visible; }
           
            .op-toggle-btn { width: 38px; height: 38px; }
            .op-profile-card { margin-bottom: 16px; padding: 16px; border-radius: 10px; gap: 12px; align-items: flex-start; }
            .op-avatar { width: 44px; height: 44px; font-size: 18px; }
            .op-profile-meta { gap: 8px; }
            .op-meta-chip { width: 100%; align-items: flex-start; }
            .op-content-card { padding: 16px; border-radius: 10px; min-height: 240px; }
            .op-content-header { margin-bottom: 16px; padding-bottom: 12px; }
            .op-task-grid, .lv-cards-grid { grid-template-columns: 1fr; gap: 12px; }
            .op-task-card, .lv-card { padding: 16px; border-radius: 10px; }
            .op-task-top, .lv-card-top { flex-direction: column; }
            .op-task-footer { align-items: stretch; flex-direction: column; }
            .op-status-select { width: 100%; padding: 9px 10px; }
            .lv-form-wrap { gap: 14px; }
            .lv-form-info { padding: 12px 13px; }
            .lv-form-grid { grid-template-columns: 1fr; gap: 14px; }
            .lv-col-2 { grid-column: span 1; }
            .lv-actions-row { flex-direction: column-reverse; align-items: stretch; }
            .lv-btn-submit, .lv-btn-reset { width: 100%; justify-content: center; }
            .lv-actions { flex-direction: column; }
            .lv-btn-approve, .lv-btn-reject { width: 100%; justify-content: center; padding: 9px 14px; }
            .op-empty-state { padding: 38px 16px; }
            .op-toast { left: 14px; right: 14px; bottom: 16px; justify-content: center; }
            .tf-bar { gap: 6px; padding: 10px 12px; }
            .tf-divider { display: none; }
            .tf-date { width: 100%; }
            .tf-group { width: 100%; }
            .tf-select { width: 100%; }
            .tf-clear { width: 100%; justify-content: center; margin-left: 0; }
          }

          @media (max-width: 380px) {
            .op-main { padding: 12px 10px 20px; }
            .op-content-card, .op-profile-card { padding: 14px; }
            .op-page-title { font-size: 16px; }
            .op-task-card, .lv-card { padding: 14px; }
          }
            .op-header-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

            .tf-bar-inline { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-left: auto; }

            .tf-mobile-btn { display: none; width: 32px; height: 32px; border-radius: 8px;
              border: 1px solid #c9d0d4d0; background: #f8fafc; color: #475569; 
              cursor: pointer; align-items: center; justify-content: center; flex-shrink: 0; }
            .tf-mobile-btn.active { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }

            .tf-popup { position: absolute; top: calc(100% + 8px); right: 0; z-index: 200;
              background: #fff; border: 1px solid #c9d0d4d0; border-radius: 12px;
              box-shadow: 0 8px 24px rgba(0,0,0,.12); padding: 14px; width: 290px; }

            /* On desktop hide mobile btn, on mobile hide inline bar and show btn */
            @media (max-width: 760px) {
              .tf-bar-inline { display: none; }
              .tf-mobile-btn { display: inline-flex; }
              .tf-popup .tf-bar { flex-direction: column; }
              .tf-popup .tf-divider { display: none; }
              .tf-popup .tf-group { width: 100%; }
              .tf-popup .tf-select, .tf-popup .tf-date { width: 100%; }
              .tf-popup .tf-clear { width: 100%; justify-content: center; margin-left: 0; }
            }
            .op-reschedule-btn {
              display: inline-flex; align-items: center; gap: 5px;
              font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
              color: #7c3aed; background: #f5f3ff; border: 1px solid #e0e7ff;
              border-radius: 6px; padding: 4px 10px; cursor: pointer;
              transition: background .15s;
            }
            .op-reschedule-btn:hover { background: #c0bcce; }
            
        `}</style>

        <div className="op-root">
          <Navbar onMenuToggle={() => setSidebarOpen(p => !p)} menuOpen={sidebarOpen} />
          {toast && (
            <div className={`op-toast op-toast-${toast.type}`}>
              {toast.type==="success"
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              }
              {toast.msg}
            </div>
          )}
            
          <div className="op-body">
            {sidebarOpen && (
              <button className="op-sidebar-backdrop" aria-label="Close sidebar" onClick={()=>setSidebarOpen(false)} />
            )}
            <aside className={`op-sidebar${sidebarOpen ? "" : " collapsed"}`}>
              <div className="op-sidebar-header">
                <button className="op-sidebar-close" aria-label="Close sidebar" onClick={()=>setSidebarOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <nav className="op-nav">
                <span className="op-nav-section">Tasks</span>
                {TASK_NAV.map(item=>(
                  <button key={item.key} className={`op-nav-item${activeTab===item.key?" active":""}`} onClick={()=>handleNavClick(item.key)}>
                    <span className="op-nav-icon">{item.icon}</span>{item.label}
                  </button>
                ))}
                <span className="op-nav-section" style={{marginTop:8}}>Leave</span>
                {LEAVE_NAV.map(item=>(
                  <button key={item.key} className={`op-nav-item${activeTab===item.key?" active":""}`} onClick={()=>handleNavClick(item.key)}>
                    <span className="op-nav-icon">{item.icon}</span>
                    {item.label}
                    {item.key==="proxy-request" && proxyPendingCount>0 && (
                      <span className="op-nav-badge">{proxyPendingCount}</span>
                    )}
                    {item.key==="my-reschedules" && unreadReschedules>0 && (
                      <span className="op-nav-badge" style={{background:"#7c3aed"}}>{unreadReschedules}</span>
                    )}
                  </button>
                ))}

                <span className="op-nav-section" style={{ marginTop: 8 }}>Reports</span>
                  {REPORTS_NAV.map(item => (
                  <button
                    key={item.key}
                    className={`op-nav-item${activeTab === item.key ? " active" : ""}`}
                    onClick={() => handleNavClick(item.key)}
                  >
                    <span className="op-nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <main className="op-main">



              <div className="op-content-card">
                <div className="op-content-header">
                  <div className="op-header-left">
                    <div className="op-content-icon">{activeItem?.icon}</div>
                    <span className="op-content-title">{activeItem?.label}</span>
                  </div>

                  {/* Show filter controls only on task tabs */}
                  {["my-tasks","recurring-tasks","delegated-tasks"].includes(activeTab) && (
                    <>
                      {/* Desktop: inline filter bar */}
                      <div className="tf-bar-inline">
                        <TaskFilterBar
                          filters={
                            activeTab === "my-tasks" ? myTaskFilters
                            : activeTab === "recurring-tasks" ? recurringFilters
                            : delegatedFilters
                          }
                          onChange={
                            activeTab === "my-tasks" ? makeFilterChange(setMyTaskFilters)
                            : activeTab === "recurring-tasks" ? makeFilterChange(setRecurringFilters)
                            : makeFilterChange(setDelegatedFilters)
                          }
                          onClear={
                            activeTab === "my-tasks" ? makeFilterClear(setMyTaskFilters)
                            : activeTab === "recurring-tasks" ? makeFilterClear(setRecurringFilters)
                            : makeFilterClear(setDelegatedFilters)
                          }
                          taskList={
                            activeTab === "my-tasks" ? myTasks
                            : activeTab === "recurring-tasks" ? recurringTasks
                            : delegatedMixed
                          }
                          showAssignedBy={activeTab === "delegated-tasks"}
                        />
                      </div>

                      {/* Mobile: filter icon button + popup */}
                      <div style={{ position:"relative", marginLeft:"auto", flexShrink:0 }}>
                        <button
                          className={`tf-mobile-btn${mobileFilterOpen ? " active" : ""}`}
                          onClick={() => setMobileFilterOpen(p => !p)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                          </svg>
                        </button>
                        {mobileFilterOpen && (
                          <div className="tf-popup">
                            <TaskFilterBar
                              filters={
                                activeTab === "my-tasks" ? myTaskFilters
                                : activeTab === "recurring-tasks" ? recurringFilters
                                : delegatedFilters
                              }
                              onChange={
                                activeTab === "my-tasks" ? makeFilterChange(setMyTaskFilters)
                                : activeTab === "recurring-tasks" ? makeFilterChange(setRecurringFilters)
                                : makeFilterChange(setDelegatedFilters)
                              }
                              onClear={
                                activeTab === "my-tasks" ? makeFilterClear(setMyTaskFilters)
                                : activeTab === "recurring-tasks" ? makeFilterClear(setRecurringFilters)
                                : makeFilterClear(setDelegatedFilters)
                              }
                              taskList={
                                activeTab === "my-tasks" ? myTasks
                                : activeTab === "recurring-tasks" ? recurringTasks
                                : delegatedMixed
                              }
                              showAssignedBy={activeTab === "delegated-tasks"}
                            />
                          </div>
                        )}
                      </div>

                    </>
                  )}
                </div>
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
        {rescheduleTask && (
  <div
    style={{ position:"fixed", inset:0, zIndex:10030, background:"rgba(15,23,42,.45)", backdropFilter:"blur(3px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
    onClick={e => { if (e.target===e.currentTarget) setRescheduleTask(null); }}
  >
    <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:480, boxShadow:"0 20px 60px rgba(0,0,0,.2)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px 14px", borderBottom:"1px solid #f1f5f9" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#7c3aed" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:"#1e293b" }}>Request Reschedule</span>
        </div>
        <button
          onClick={() => setRescheduleTask(null)}
          style={{ width:30, height:30, borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
 
      {/* Body */}
      <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
        {/* Task info */}
        <div style={{ background:"#f8fafc", border:"1px solid #e8edf3", borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:"#1e293b" }}>{rescheduleTask.title}</div>
          <div style={{ fontSize:12, color:"#64748b", marginTop:4, display:"flex", gap:12, flexWrap:"wrap" }}>
            {rescheduleTask.due_date && (
              <span>Current due: <strong>{new Date(rescheduleTask.due_date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</strong></span>
            )}
            {rescheduleTask.site_name && <span>Site: <strong>{rescheduleTask.site_name}</strong></span>}
          </div>
        </div>
 
        {/* New date */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#475569" }}>
            Requested New Date <span style={{ color:"#dc2626" }}>*</span>
          </label>
          <input
            type="date"
            style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"#1e293b", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"9px 12px", outline:"none", width:"100%" }}
            min={rescheduleTask.due_date ? rescheduleTask.due_date : new Date().toISOString().slice(0,10)}
            value={rescheduleForm.requested_date}
            onChange={e => setRescheduleForm(p => ({ ...p, requested_date: e.target.value }))}
          />
          <span style={{ fontSize:11.5, color:"#94a3b8" }}>Must be after the current due date.</span>
        </div>
 
        {/* Reason */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#475569" }}>
            Reason for Reschedule <span style={{ color:"#dc2626" }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Briefly explain why you need a reschedule…"
            style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"#1e293b", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"9px 12px", outline:"none", width:"100%", resize:"vertical", minHeight:80 }}
            value={rescheduleForm.reason}
            onChange={e => setRescheduleForm(p => ({ ...p, reason: e.target.value }))}
          />
        </div>
      </div>
 
      {/* Footer */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 22px 18px", borderTop:"1px solid #f1f5f9" }}>
        <button
          onClick={() => setRescheduleTask(null)}
          style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#f1f5f9", color:"#475569", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, padding:"9px 16px", borderRadius:8, border:"1px solid #e2e8f0", cursor:"pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={handleRescheduleSubmit}
          disabled={rescheduleSub}
          style={{ display:"inline-flex", alignItems:"center", gap:7, background:"#7c3aed", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, padding:"9px 20px", borderRadius:8, border:"none", cursor:"pointer", opacity: rescheduleSub ? 0.6 : 1 }}
        >
          {rescheduleSub
            ? <><span style={{ display:"inline-block", width:13, height:13, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .6s linear infinite" }}/> Submitting…</>
            : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg> Submit Request</>
          }
        </button>
      </div>
    </div>
  </div>
)}
{detailTask && (
  <div
    style={{position:"fixed",inset:0,zIndex:10030,background:"rgba(15,23,42,.45)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
    onClick={e => { if (e.target===e.currentTarget) setDetailTask(null); }}
  >
    <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,padding:"18px 22px 14px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:1,borderRadius:"16px 16px 0 0"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:16,fontWeight:700,color:"#1e293b",lineHeight:1.3}}>{detailTask.title}</div>
          {detailTask.site_name && <div style={{fontSize:12,color:"#94a3b8",marginTop:3}}>{detailTask.site_name}</div>}
        </div>
        <button
          onClick={() => setDetailTask(null)}
          style={{width:30,height:30,borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",flexShrink:0}}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Body */}
      <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:18}}>

        {/* Status + Priority row */}
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {(() => { const p=PRIORITY_STYLES[detailTask.priority]||PRIORITY_STYLES.medium; return (
            <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:20,background:p.bg,color:p.color}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:p.dot,flexShrink:0}}/>
              {detailTask.priority} priority
            </span>
          );})()}
          {(() => { const s=STATUS_STYLES[detailTask.status]||STATUS_STYLES.pending; return (
            <span style={{display:"inline-flex",alignItems:"center",fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:20,background:s.bg,color:s.color}}>
              {detailTask.status?.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}
            </span>
          );})()}
          {detailTask.is_recurring && detailTask.recurrence && (
            <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:20,background:"#eff6ff",color:"#2563eb"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              {detailTask.recurrence}
            </span>
          )}
          {detailTask.has_checkpoints && (
            <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:20,background:"#f0fdf4",color:"#16a34a"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Has checklist
            </span>
          )}
        </div>

        {/* Meta grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {label:"Assigned By", value: detailTask.assigned_by || "—"},
            {label:"Due Date",    value: detailTask.due_date ? new Date(detailTask.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"},
            {label:"Site",        value: detailTask.site_name || "—"},
            {label:"Created",     value: detailTask.created_at ? new Date(detailTask.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"},
          ].map(({label,value}) => (
            <div key={label} style={{background:"#f8fafc",border:"1px solid #e8edf3",borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#94a3b8",marginBottom:4}}>{label}</div>
              <div style={{fontSize:13,fontWeight:600,color:"#334155"}}>{value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {detailTask.description && (
          <div style={{background:"#f8fafc",border:"1px solid #e8edf3",borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#94a3b8",marginBottom:8}}>Description</div>
            <p style={{fontSize:13.5,color:"#475569",lineHeight:1.6,margin:0}}>{detailTask.description}</p>
          </div>
        )}

        {/* Audio player */}
        {detailTask.audio_url && (
          <div style={{background:"#f5f3ff",border:"1px solid #e0e7ff",borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#7c3aed",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              Audio Instruction
            </div>
            <audio
              controls
              src={detailTask.audio_url}
              style={{width:"100%",borderRadius:8,outline:"none"}}
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {/* Document */}
        {detailTask.document_url && (
          <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:"#2563eb",marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Attached Document
            </div>
            
              <a href={detailTask.document_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:8,background:"#2563eb",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,padding:"9px 16px",borderRadius:8,textDecoration:"none",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="#1d4ed8"}
              onMouseLeave={e=>e.currentTarget.style.background="#2563eb"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Open / Download Document
            </a>
          </div>
        )}

      </div>
    </div>
  </div>
)}


{checklistModal && (
  <div
    style={{ position:"fixed", inset:0, zIndex:10030, background:"rgba(15,23,42,.45)", backdropFilter:"blur(3px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
    onClick={e => { if (e.target === e.currentTarget) setChecklistModal(null); }}
  >
    <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:500, boxShadow:"0 20px 60px rgba(0,0,0,.2)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px 14px", borderBottom:"1px solid #f1f5f9" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", color:"#16a34a" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:"#1e293b" }}>Complete Checklist</span>
        </div>
        <button
          onClick={() => setChecklistModal(null)}
          style={{ width:30, height:30, borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
        
        {/* Task info */}
        <div style={{ background:"#f8fafc", border:"1px solid #e8edf3", borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:"#1e293b" }}>{checklistModal.title}</div>
          {checklistModal.site_name && (
            <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>{checklistModal.site_name}</div>
          )}
        </div>

        {/* Info banner */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:9, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"10px 13px", fontSize:12.5, color:"#92400e", lineHeight:1.5 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Tick all items below to confirm this task is complete before submitting.</span>
        </div>

        {/* Checklist items */}
        {fetchingCPs ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"16px 0" }}>
            <div className="op-spinner"/>
          </div>
        ) : checkpoints.length === 0 ? (
          <div style={{ textAlign:"center", color:"#94a3b8", fontSize:13, padding:"12px 0" }}>No checklist items found.</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {checkpoints.map((cp, i) => {
              const checked = !!checkedItems[cp.id];
              return (
                <label
                  key={cp.id}
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", borderRadius:10, border:`1px solid ${checked ? "#bbf7d0" : "#e8edf3"}`, background: checked ? "#f0fdf4" : "#fafafa", cursor:"pointer", transition:"all .15s" }}
                >
                  <div style={{ position:"relative", flexShrink:0, marginTop:1 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => setCheckedItems(prev => ({ ...prev, [cp.id]: e.target.checked }))}
                      style={{ width:18, height:18, accentColor:"#16a34a", cursor:"pointer" }}
                    />
                  </div>
                  <span style={{ fontSize:13.5, color: checked ? "#15803d" : "#334155", fontWeight: checked ? 600 : 400, lineHeight:1.5, textDecoration: checked ? "none" : "none" }}>
                    {i + 1}. {cp.checkpoint}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* Progress indicator */}
        {checkpoints.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1, height:6, background:"#e8edf3", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", background:"#16a34a", borderRadius:99, width:`${(Object.values(checkedItems).filter(Boolean).length / checkpoints.length) * 100}%`, transition:"width .2s" }}/>
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:"#64748b", flexShrink:0 }}>
              {Object.values(checkedItems).filter(Boolean).length}/{checkpoints.length}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 22px 18px", borderTop:"1px solid #f1f5f9" }}>
        <button
          onClick={() => setChecklistModal(null)}
          style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#f1f5f9", color:"#475569", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, padding:"9px 16px", borderRadius:8, border:"1px solid #e2e8f0", cursor:"pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={handleChecklistConfirm}
          disabled={checkpoints.length === 0 || Object.values(checkedItems).filter(Boolean).length < checkpoints.length}
          style={{ display:"inline-flex", alignItems:"center", gap:7, background:"#16a34a", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, padding:"9px 20px", borderRadius:8, border:"none", cursor: checkpoints.every(cp => checkedItems[cp.id]) ? "pointer" : "not-allowed", opacity: checkpoints.every(cp => checkedItems[cp.id]) ? 1 : 0.5, transition:"opacity .15s" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          Mark as Completed
        </button>
      </div>
    </div>
  </div>  
)}




      </>
    );
  } 
