import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";
import { useRecurringTasks } from "../hooks/useRecurringTasks";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    key: "assign-task",
    label: "Assign Task",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
  },
  {
    key: "all-tasks",
    label: "All Tasks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    key: "leave-requests",
    label: "Leave Requests",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <path d="M9 16l2 2 4-4"/>
      </svg>
    ),
  },
  {
    key: "manage-users",
    label: "Manage Users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

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

const LEAVE_STATUS_STYLES = {
  pending:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  approved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const EMPTY_FORM = {
  title: "",
  description: "",
  assigned_to: "",
  site_name: "",
  priority: "medium",
  due_date: "",
  status: "pending",
  is_recurring: false,
  recurrence: "",
  // anchor fields (only used when is_recurring = true)
  anchor_weekday:    "1",   // for weekly  (0–6)
  anchor_day:        "1",   // for monthly (1–31)
  anchor_month:      "1",   // for yearly  (1–12)
  anchor_month_day:  "1",   // for yearly  (1–31)
};

// ── helpers ────────────────────────────────────────────────────────────────

function daysInMonth(month) {
  // month is 1-based; use a non-leap year for generic max
  return new Date(2001, parseInt(month, 10), 0).getDate();
}

function buildAnchor(form) {
  switch (form.recurrence) {
    case "daily":   return null;
    case "weekly":  return String(form.anchor_weekday);
    case "monthly": return String(form.anchor_day);
    case "yearly":  return `${String(form.anchor_month).padStart(2,"0")}-${String(form.anchor_month_day).padStart(2,"0")}`;
    default:        return null;
  }
}

function anchorDescription(recurrence, anchor) {
  if (!anchor) return null;
  switch (recurrence) {
    case "weekly":  return `every ${WEEKDAYS[parseInt(anchor, 10)]}`;
    case "monthly": return `on the ${anchor}${ordinal(parseInt(anchor,10))} of every month`;
    case "yearly": {
      const [mm, dd] = anchor.split("-");
      return `every year on ${MONTHS[parseInt(mm,10)-1]} ${parseInt(dd,10)}`;
    }
    default: return null;
  }
}

function ordinal(n) {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
}

function computeLeaveStatus(leave) {
  const storedStatus = normalizeText(leave.status);
  if (leave.admin_approved === false || leave.proxy_approved === false || storedStatus === "rejected") return "rejected";
  const proxyDone = !leave.proxy_user_name || leave.proxy_approved === true;
  if ((leave.admin_approved === true || storedStatus === "approved") && proxyDone) return "approved";
  return "pending";
}

function formatLeaveDate(date) {
  return date ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "N/A";
}

function getLeaveDays(leave) {
  if (!leave.from_date || !leave.to_date) return null;
  return Math.ceil((new Date(leave.to_date) - new Date(leave.from_date)) / (1000 * 60 * 60 * 24)) + 1;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isSiteEngineerLeave(leave) {
  return [leave.role, leave.designation, leave.user_role, leave.user_designation]
    .map(normalizeText)
    .some((value) => value === "site engineer" || value === "site_engineer");
}

function getHeadApprovalText(leave) {
  const storedStatus = normalizeText(leave.status);
  const headName = leave.proxy_user_name || leave.head_user_names;
  if (leave.proxy_approved === true || storedStatus === "approved") return "Head: Approved";
  if (leave.proxy_approved === false || storedStatus === "rejected") return "Head: Rejected";
  return headName ? `Head (${headName}): Pending` : "Head: Pending";
}

function getHeadApprovalClass(leave) {
  const storedStatus = normalizeText(leave.status);
  if (leave.proxy_approved === true || storedStatus === "approved") return "ok";
  if (leave.proxy_approved === false || storedStatus === "rejected") return "no";
  return "";
}

function isFinalLeaveStatus(leave) {
  const storedStatus = normalizeText(leave.status);
  return storedStatus === "approved" || storedStatus === "rejected";
}


// ── sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="ap-stat-card" style={{ borderTopColor: accent }}>
      <div className="ap-stat-icon" style={{ background: accent + "18", color: accent }}>{icon}</div>
      <div className="ap-stat-body">
        <div className="ap-stat-value">{value}</div>
        <div className="ap-stat-label">{label}</div>
      </div>
    </div>
  );
}

function TaskRow({ task, onDelete }) {
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const s = STATUS_STYLES[task.status]     || STATUS_STYLES.pending;
  return (
    <tr className="ap-tr">
      <td className="ap-td ap-td-title">
        {task.parent_task_id && <span className="ap-child-badge" title="Auto-generated instance">↳</span>}
        {task.title}
      </td>
      <td className="ap-td">{task.assigned_to}</td>
      <td className="ap-td">{task.site_name || "—"}</td>
      <td className="ap-td">
        <span className="ap-badge" style={{ background: p.bg, color: p.color }}>
          <span className="ap-badge-dot" style={{ background: p.dot }} />{task.priority}
        </span>
      </td>
      <td className="ap-td">
        <span className="ap-badge" style={{ background: s.bg, color: s.color }}>{task.status?.replace("_"," ")}</span>
      </td>
      <td className="ap-td">{task.due_date ? new Date(task.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"}</td>
      <td className="ap-td">
        {task.is_recurring
          ? <span className="ap-pill-blue">{anchorDescription(task.recurrence, task.recurrence_anchor) || task.recurrence}</span>
          : task.parent_task_id
            ? <span className="ap-pill-orange">instance</span>
            : <span style={{ color:"#94a3b8", fontSize:12 }}>—</span>}
      </td>
      <td className="ap-td">
        <button className="ap-del-btn" onClick={() => onDelete(task.id)} title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}

function TaskCard({ task, onDelete }) {
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const s = STATUS_STYLES[task.status]     || STATUS_STYLES.pending;
  const schedule = task.is_recurring
    ? anchorDescription(task.recurrence, task.recurrence_anchor) || task.recurrence
    : task.parent_task_id
      ? "instance"
      : "one-time";

  return (
    <div className="ap-task-card-mobile">
      <div className="ap-task-card-head">
        <div>
          <div className="ap-task-card-title">
            {task.parent_task_id && <span className="ap-child-badge" title="Auto-generated instance">↳</span>}
            {task.title}
          </div>
          <div className="ap-task-card-sub">{task.assigned_to || "Unassigned"}</div>
        </div>
        <button className="ap-del-btn" onClick={() => onDelete(task.id)} title="Delete" aria-label="Delete task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      <div className="ap-task-card-badges">
        <span className="ap-badge" style={{ background: p.bg, color: p.color }}>
          <span className="ap-badge-dot" style={{ background: p.dot }} />{task.priority}
        </span>
        <span className="ap-badge" style={{ background: s.bg, color: s.color }}>{task.status?.replace("_"," ")}</span>
        <span className={task.is_recurring ? "ap-pill-blue" : task.parent_task_id ? "ap-pill-orange" : "ap-mobile-pill-muted"}>{schedule}</span>
      </div>

      <div className="ap-task-card-meta">
        <div><span>Site</span><strong>{task.site_name || "Not assigned"}</strong></div>
        <div><span>Due Date</span><strong>{task.due_date ? new Date(task.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "Not set"}</strong></div>
      </div>
    </div>
  );
}

function LeaveStatusBadge({ leave }) {
  const status = computeLeaveStatus(leave);
  const style = LEAVE_STATUS_STYLES[status];
  return (
    <span className="ap-leave-status" style={{ background: style.bg, color: style.color, borderColor: style.border }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LeaveRequestCard({ leave, onAction, updating }) {
  const status = computeLeaveStatus(leave);
  const days = getLeaveDays(leave);
  const managedByHead = isSiteEngineerLeave(leave);
  const canAct = !managedByHead
    && (leave.admin_approved === null || leave.admin_approved === undefined)
    && !isFinalLeaveStatus(leave);

  return (
    <div className="ap-leave-card" style={{ borderLeftColor: status === "approved" ? "#16a34a" : status === "rejected" ? "#dc2626" : "#f59e0b" }}>
      <div className="ap-leave-card-top">
        <div>
          <div className="ap-leave-title">{leave.name || leave.user_name || "Employee"}</div>
          <div className="ap-leave-sub">{leave.user_name || "No username"}{leave.site_name ? ` - ${leave.site_name}` : ""}</div>
        </div>
        <LeaveStatusBadge leave={leave} />
      </div>

      <div className="ap-leave-meta">
        {(leave.role || leave.designation) && <span>{leave.role || leave.designation}</span>}
        <span>{leave.leave_type || "Leave"}</span>
        <span>{formatLeaveDate(leave.from_date)} to {formatLeaveDate(leave.to_date)}</span>
        {days && <span>{days} day{days > 1 ? "s" : ""}</span>}
      </div>

      {leave.reason && <p className="ap-leave-reason">{leave.reason}</p>}

      <div className="ap-leave-approvals">
        {managedByHead ? (
          <span className={`ap-approval-pill ${getHeadApprovalClass(leave)}`}>
            {getHeadApprovalText(leave)}
          </span>
        ) : (
          <>
            {leave.admin_approved === true && (
              <span className="ap-approval-pill ok">Admin: Approved</span>
            )}
            {leave.admin_approved === false && (
              <span className="ap-approval-pill no">Admin: Rejected</span>
            )}
            {leave.proxy_user_name ? (
              <span className={`ap-approval-pill ${leave.proxy_approved === true ? "ok" : leave.proxy_approved === false ? "no" : ""}`}>
                Proxy ({leave.proxy_user_name}): {leave.proxy_approved === true ? "Accepted" : leave.proxy_approved === false ? "Declined" : "Pending"}
              </span>
            ) : (
              leave.admin_approved === null || leave.admin_approved === undefined
                ? <span className="ap-approval-pill">Admin: Pending</span>
                : null
            )}
          </>
        )}
      </div>
      {leave.rejection_reason && <div className="ap-leave-rejection">{leave.rejection_reason}</div>}

      {canAct ? (
        <div className="ap-leave-actions">
          <button className="ap-btn-approve" disabled={updating === leave.id} onClick={() => onAction(leave, true)}>Approve</button>
          <button className="ap-btn-reject"  disabled={updating === leave.id} onClick={() => onAction(leave, false)}>Reject</button>
          {updating === leave.id && <span className="ap-saving">saving...</span>}
        </div>
      ) : managedByHead ? (
        <div className="ap-leave-done">Managed by site head - admin can view status only.</div>
      ) : (
        <div className="ap-leave-done">Admin decision already submitted.</div>
      )}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function AdminPortal() {
  const [user, setUser]               = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === "undefined" ? true : window.innerWidth > 760);
  const [activeTab, setActiveTab]     = useState("dashboard");

  const [allTasks, setAllTasks]       = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [allLeaves, setAllLeaves]     = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [updatingLeaveId, setUpdatingLeaveId] = useState(null);

  const [form, setForm]               = useState(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);

  const fetchAllTasks = useCallback(async () => {
    setLoadingTasks(true);
    const { data } = await supabase.from("tasks").select("*").order("created_at",{ ascending:false });
    setAllTasks(data || []);
    setLoadingTasks(false);
  }, []);

  const fetchAllLeaves = useCallback(async () => {
    setLoadingLeaves(true);
    const { data, error } = await supabase.from("leaves").select("*").order("created_at",{ ascending:false });
    if (error) {
      showToast("error","Failed to load leaves. " + error.message);
    } else {
      const leaves = data || [];
      const userNames = [...new Set(leaves.map((leave) => leave.user_name).filter(Boolean))];
      let siteNames = [...new Set(leaves.map((leave) => leave.site_name).filter(Boolean))];
      let usersByName = {};
      let headsBySite = {};

      if (userNames.length) {
        const { data: users } = await supabase
          .from("users")
          .select("user_name, role, site_name")
          .in("user_name", userNames);

        usersByName = (users || []).reduce((map, item) => ({
          ...map,
          [item.user_name]: item,
        }), {});

        siteNames = [
          ...new Set([
            ...siteNames,
            ...(users || []).map((item) => item.site_name).filter(Boolean),
          ]),
        ];
      }

      if (siteNames.length) {
        const { data: heads } = await supabase
          .from("site_details")
          .select("site_name, user_name, role")
          .in("site_name", siteNames)
          .eq("role", "Project Head");

        headsBySite = (heads || []).reduce((map, item) => ({
          ...map,
          [item.site_name]: [...(map[item.site_name] || []), item.user_name],
        }), {});
      }

      setAllLeaves(leaves.map((leave) => ({
        ...leave,
        role: leave.role || usersByName[leave.user_name]?.role || "",
        site_name: leave.site_name || usersByName[leave.user_name]?.site_name || "",
        head_user_names: headsBySite[leave.site_name || usersByName[leave.user_name]?.site_name]?.join(", ") || "",
      })));
    }
    setLoadingLeaves(false);
  }, []);

  useEffect(() => { if (user) { fetchAllTasks(); fetchAllLeaves(); } }, [user, fetchAllTasks, fetchAllLeaves]);

  // ── Auto-generate recurring task instances on load ─────────────────────
  useRecurringTasks(user, fetchAllTasks);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleNavClick = (key) => {
    setActiveTab(key);
    if (typeof window !== "undefined" && window.innerWidth <= 760) {
      setSidebarOpen(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "is_recurring" && !checked ? { recurrence:"" } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim())       return showToast("error","Title is required.");
    if (!form.assigned_to.trim()) return showToast("error","Assigned To is required.");
    if (form.is_recurring && !form.recurrence) return showToast("error","Please select a recurrence pattern.");

    const anchor = form.is_recurring ? buildAnchor(form) : null;

    setSubmitting(true);
    const payload = {
      title:             form.title.trim(),
      description:       form.description.trim() || null,
      assigned_to:       form.assigned_to.trim(),
      site_name:         form.site_name.trim() || null,
      assigned_by:       user.user_name,
      priority:          form.priority,
      status:            form.status,
      due_date:          form.due_date || null,
      is_recurring:      form.is_recurring,
      recurrence:        form.is_recurring ? form.recurrence : null,
      recurrence_anchor: anchor,
      last_generated_date: null,
      parent_task_id:    null,
    };

    const { error } = await supabase.from("tasks").insert([payload]);
    setSubmitting(false);

    if (error) {
      showToast("error","Failed to assign task. " + error.message);
    } else {
      const desc = form.is_recurring ? anchorDescription(form.recurrence, anchor) : null;
      showToast("success", `Task "${form.title}" assigned${desc ? ` — repeats ${desc}` : ""}!`);
      setForm({ ...EMPTY_FORM });
      fetchAllTasks();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    setAllTasks((p) => p.filter((t) => t.id !== id));
    showToast("success","Task deleted.");
  };

  const handleLeaveAction = async (leave, approved) => {
    const reason = approved ? null : window.prompt("Reason for rejecting this leave?") || "Rejected by admin";
    setUpdatingLeaveId(leave.id);

    const payload = {
      admin_approved: approved,
      approved_by: approved ? user.user_name : null,
      rejection_reason: approved ? null : reason,
      status: approved ? "Approved" : "Rejected",
    };

    const { error } = await supabase.from("leaves").update(payload).eq("id", leave.id);
    setUpdatingLeaveId(null);

    if (error) {
      showToast("error","Failed to update leave. " + error.message);
      return;
    }

    setAllLeaves((prev) => prev.map((item) => item.id === leave.id ? { ...item, ...payload } : item));
    showToast("success", approved ? "Leave approved." : "Leave rejected.");
  };

  if (!user) return <h2 style={{ textAlign:"center", marginTop:80, color:"#94a3b8" }}>Loading…</h2>;

  const activeItem = NAV_ITEMS.find((n) => n.key === activeTab);
  const total      = allTasks.length;
  const pending    = allTasks.filter((t) => t.status === "pending").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const completed  = allTasks.filter((t) => t.status === "completed").length;
  const leaveTotal = allLeaves.length;
  const leavePending = allLeaves.filter((l) => computeLeaveStatus(l) === "pending").length;
  const leavePendingForAdmin = allLeaves.filter((l) => computeLeaveStatus(l) === "pending" && !isSiteEngineerLeave(l)).length;
  const leaveApproved = allLeaves.filter((l) => computeLeaveStatus(l) === "approved").length;
  const leaveRejected = allLeaves.filter((l) => computeLeaveStatus(l) === "rejected").length;
  const recentLeaves = allLeaves.slice(0, 4);

  // anchor preview text for form UI
  const liveAnchor     = form.is_recurring ? buildAnchor(form) : null;
  const anchorPreview  = form.is_recurring && form.recurrence
    ? anchorDescription(form.recurrence, liveAnchor)
    : null;

  const monthDays = daysInMonth(form.anchor_month);

  const renderContent = () => {
    switch (activeTab) {

      // ── DASHBOARD ────────────────────────────────────────────────────────
      case "dashboard":
        return (
          <>
            <div className="ap-stats-row">
              <StatCard label="Total Tasks" value={total} accent="#2563eb" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg>
              }/>
              <StatCard label="Pending" value={pending} accent="#f59e0b" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              }/>
              <StatCard label="In Progress" value={inProgress} accent="#6366f1" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              }/>
              <StatCard label="Completed" value={completed} accent="#16a34a" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              }/><StatCard label="Pending Admin Leaves" value={leavePendingForAdmin} accent="#dc2626" icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              }/>
            </div>
            <div className="ap-leave-summary">
              <div>
                <span>Total leave requests</span>
                <strong>{leaveTotal}</strong>
              </div>
              <div>
                <span>Approved</span>
                <strong>{leaveApproved}</strong>
              </div>
              <div>
                <span>Rejected</span>
                <strong>{leaveRejected}</strong>
              </div>
              <div>
                <span>Pending admin action</span>
                <strong>{leavePendingForAdmin}</strong>
              </div>
            </div>
            {recentLeaves.length > 0 && (
              <div className="ap-recent-leaves">
                <div className="ap-section-title">Recent Leave Requests</div>
                <div className="ap-recent-list">
                  {recentLeaves.map((leave) => (
                    <div key={leave.id} className="ap-recent-leave">
                      <div>
                        <strong>{leave.name || leave.user_name || "Employee"}</strong>
                        <span>{leave.leave_type} - {formatLeaveDate(leave.from_date)} to {formatLeaveDate(leave.to_date)}</span>
                      </div>
                      <LeaveStatusBadge leave={leave} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="ap-dash-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Recurring tasks auto-generate new instances on their scheduled day. If the previous instance is incomplete, the new one includes a warning note.
            </div>
          </>
        );

      // ── ASSIGN TASK ──────────────────────────────────────────────────────
      case "assign-task":
        return (
          <div className="ap-form-grid">
            {/* Row 1 */}
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Task Title <span className="ap-req">*</span></label>
                <input className="ap-input" name="title" value={form.title} onChange={handleFormChange} placeholder="e.g. Inspect electrical panel" />
              </div>
              <div className="ap-field">
                <label className="ap-label">Assign To (username) <span className="ap-req">*</span></label>
                <input className="ap-input" name="assigned_to" value={form.assigned_to} onChange={handleFormChange} placeholder="e.g. john_doe" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="ap-form-row ap-col-1">
              <div className="ap-field">
                <label className="ap-label">Description</label>
                <textarea className="ap-input ap-textarea" name="description" value={form.description} onChange={handleFormChange} placeholder="Add task details, instructions, or notes…" rows={3} />
              </div>
            </div>

            {/* Row 3 */}
            <div className="ap-form-row ap-col-3">
              <div className="ap-field">
                <label className="ap-label">Site Name</label>
                <input className="ap-input" name="site_name" value={form.site_name} onChange={handleFormChange} placeholder="e.g. Site A" />
              </div>
              <div className="ap-field">
                <label className="ap-label">Priority</label>
                <select className="ap-input ap-select" name="priority" value={form.priority} onChange={handleFormChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Initial Status</label>
                <select className="ap-input ap-select" name="status" value={form.status} onChange={handleFormChange}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Start / Due Date</label>
                <input className="ap-input" type="date" name="due_date" value={form.due_date} onChange={handleFormChange} />
              </div>
              <div className="ap-field ap-field-center">
                <label className="ap-label">Recurring Task</label>
                <label className="ap-toggle">
                  <input type="checkbox" name="is_recurring" checked={form.is_recurring} onChange={handleFormChange} />
                  <span className="ap-toggle-track">
                    <span className="ap-toggle-thumb" />
                  </span>
                  <span className="ap-toggle-label">{form.is_recurring ? "Yes" : "No"}</span>
                </label>
              </div>
            </div>

            {/* ── Recurrence section (only when is_recurring) ── */}
            {form.is_recurring && (
              <>
                <div className="ap-recurrence-divider">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Recurrence Schedule
                </div>

                {/* Pattern picker */}
                <div className="ap-form-row ap-col-2">
                  <div className="ap-field">
                    <label className="ap-label">Recurrence Pattern <span className="ap-req">*</span></label>
                    <div className="ap-recurrence-pills">
                      {["daily","weekly","monthly","yearly"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`ap-rpill${form.recurrence === r ? " active" : ""}`}
                          onClick={() => setForm((p) => ({ ...p, recurrence: r }))}
                        >
                          {r === "daily"   && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>}
                          {r === "weekly"  && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                          {r === "monthly" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/></svg>}
                          {r === "yearly"  && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>}
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Anchor selector — changes based on pattern */}
                {form.recurrence === "weekly" && (
                  <div className="ap-form-row ap-col-1">
                    <div className="ap-field">
                      <label className="ap-label">Repeat on which day?</label>
                      <div className="ap-weekday-grid">
                        {WEEKDAYS.map((day, i) => (
                          <button
                            key={day}
                            type="button"
                            className={`ap-wday${String(form.anchor_weekday) === String(i) ? " active" : ""}`}
                            onClick={() => setForm((p) => ({ ...p, anchor_weekday: String(i) }))}
                          >
                            {day.slice(0,3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {form.recurrence === "monthly" && (
                  <div className="ap-form-row ap-col-2">
                    <div className="ap-field">
                      <label className="ap-label">Repeat on day of month</label>
                      <select className="ap-input ap-select" name="anchor_day" value={form.anchor_day} onChange={handleFormChange}>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>{d}{ordinal(d)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {form.recurrence === "yearly" && (
                  <div className="ap-form-row ap-col-2">
                    <div className="ap-field">
                      <label className="ap-label">Month</label>
                      <select className="ap-input ap-select" name="anchor_month" value={form.anchor_month} onChange={handleFormChange}>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ap-field">
                      <label className="ap-label">Day</label>
                      <select className="ap-input ap-select" name="anchor_month_day" value={form.anchor_month_day} onChange={handleFormChange}>
                        {Array.from({ length: monthDays }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>{d}{ordinal(d)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Live preview */}
                {anchorPreview && (
                  <div className="ap-anchor-preview">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    This task will auto-generate a new instance <strong>{anchorPreview}</strong>. If the previous instance is still pending, a warning note will be added.
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            <div className="ap-form-row ap-col-1 ap-form-actions">
              <button className="ap-btn-secondary" onClick={() => setForm({ ...EMPTY_FORM })}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Reset
              </button>
              <button className="ap-btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><span className="ap-mini-spinner" /> Assigning…</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg> Assign Task</>
                }
              </button>
            </div>
          </div>
        );

      // ── ALL TASKS ────────────────────────────────────────────────────────
      case "all-tasks":
        return loadingTasks ? (
          <div className="op-empty-state"><div className="op-spinner"/><p className="op-empty-text">Loading tasks…</p></div>
        ) : allTasks.length === 0 ? (
          <div className="op-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.3 }}><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/></svg>
            <p className="op-empty-text">No tasks found. Start by assigning one.</p>
          </div>
        ) : (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>{["Title","Assigned To","Site","Priority","Status","Due Date","Schedule",""].map((h) => <th key={h} className="ap-th">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {allTasks.map((t) => <TaskRow key={t.id} task={t} onDelete={handleDelete}/>)}
                </tbody>
              </table>
            </div>
            <div className="ap-task-mobile-grid">
              {allTasks.map((t) => <TaskCard key={t.id} task={t} onDelete={handleDelete}/>)}
            </div>
          </>
        );

      case "leave-requests":
        return loadingLeaves ? (
          <div className="op-empty-state"><div className="op-spinner"/><p className="op-empty-text">Loading leaves...</p></div>
        ) : allLeaves.length === 0 ? (
          <div className="op-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.3 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <p className="op-empty-text">No leave requests found.</p>
          </div>
        ) : (
          <>
            <div className="ap-leave-summary ap-leave-summary-tight">
              <div><span>Total</span><strong>{leaveTotal}</strong></div>
              <div><span>Pending</span><strong>{leavePending}</strong></div>
              <div><span>Admin Action</span><strong>{leavePendingForAdmin}</strong></div>
              <div><span>Approved</span><strong>{leaveApproved}</strong></div>
              <div><span>Rejected</span><strong>{leaveRejected}</strong></div>
            </div>
            <div className="ap-leave-grid">
              {allLeaves.map((leave) => (
                <LeaveRequestCard key={leave.id} leave={leave} onAction={handleLeaveAction} updating={updatingLeaveId} />
              ))}
            </div>
          </>
        );

      case "manage-users":
        return (
          <div className="op-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.3 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <p className="op-empty-text">User management coming soon.</p>
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

        .op-root  { font-family: 'DM Sans', sans-serif; background: #f4f6f9; min-height: 100vh; color: #1e293b; }
        .op-body  { display: flex; min-height: calc(100vh - 60px); }

        .op-sidebar { width: 240px; min-width: 240px; background: #fff; border-right: 1px solid #e8edf3; display: flex; flex-direction: column; transition: width .25s cubic-bezier(.4,0,.2,1), min-width .25s, opacity .2s; overflow: hidden; box-shadow: 2px 0 12px rgba(0,0,0,.04); }
        .op-sidebar.collapsed { width: 0; min-width: 0; opacity: 0; pointer-events: none; }
        .op-sidebar-header { padding: 20px 20px 12px; border-bottom: 1px solid #f0f4f8; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .op-sidebar-label  { font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #94a3b8; }
        .op-sidebar-close { display: none; width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #64748b; cursor: pointer; align-items: center; justify-content: center; }
        .op-sidebar-backdrop { display: none; }
        .op-nav { padding: 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .op-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: #64748b; font-size: 13.5px; font-weight: 500; white-space: nowrap; border: none; background: transparent; width: 100%; text-align: left; transition: background .15s, color .15s; position: relative; }
        .op-nav-item:hover  { background: #f1f5f9; color: #1e293b; }
        .op-nav-item.active { background: #fef2f2; color: #dc2626; }
        .op-nav-item.active svg { stroke: #dc2626; }
        .op-nav-icon { flex-shrink: 0; display: flex; align-items: center; }
        .op-nav-badge { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: #dc2626; color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 999px; display: flex; align-items: center; justify-content: center; padding: 0 5px; }

        .op-main { flex: 1; padding: 28px 32px; overflow: auto; }
        .op-topbar { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .op-toggle-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; transition: background .15s; flex-shrink: 0; }
        .op-toggle-btn:hover { background: #f1f5f9; }
        .op-page-title { font-size: 18px; font-weight: 600; color: #1e293b; }

        .op-profile-card { background: #fff; border-radius: 14px; padding: 24px 28px; border-top: 4px solid #dc2626; box-shadow: 0 4px 20px rgba(220,38,38,.08); margin-bottom: 28px; display: flex; align-items: center; gap: 20px; }
        .op-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg,#fee2e2,#fecaca); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: #dc2626; flex-shrink: 0; font-family: 'DM Mono', monospace; }
        .op-profile-info { display: flex; flex-direction: column; gap: 4px; }
        .op-profile-name { font-size: 17px; font-weight: 600; color: #1e293b; }
        .op-profile-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .op-meta-chip { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 5px; }
        .op-meta-chip strong { color: #334155; }
        .ap-role-badge { font-size: 11px; font-weight: 700; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 20px; padding: 2px 10px; margin-left: 8px; letter-spacing: .04em; }

        .op-content-card { background: #fff; border-radius: 14px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,.05); min-height: 300px; }
        .op-content-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
        .op-content-icon  { width: 36px; height: 36px; border-radius: 8px; background: #fef2f2; display: flex; align-items: center; justify-content: center; color: #dc2626; }
        .op-content-title { font-size: 15px; font-weight: 600; color: #1e293b; }

        /* Stats */
        .ap-stats-row { display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap: 16px; margin-bottom: 24px; }
        .ap-stat-card  { background: #fff; border: 1px solid #e8edf3; border-top: 4px solid; border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
        .ap-stat-icon  { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ap-stat-value { font-size: 26px; font-weight: 700; color: #1e293b; font-family: 'DM Mono', monospace; line-height: 1; }
        .ap-stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
        .ap-dash-hint  { display: flex; align-items: flex-start; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; font-size: 13px; color: #64748b; line-height: 1.5; }
        .ap-dash-hint svg { flex-shrink: 0; margin-top: 1px; color: #2563eb; }
        .ap-section-title { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; }
        .ap-leave-summary { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 12px; margin-bottom: 18px; }
        .ap-leave-summary-tight { margin-bottom: 20px; }
        .ap-leave-summary div { background: #f8fafc; border: 1px solid #e8edf3; border-radius: 10px; padding: 13px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .ap-leave-summary span { font-size: 12px; color: #64748b; }
        .ap-leave-summary strong { font-size: 20px; color: #1e293b; font-family: 'DM Mono', monospace; }
        .ap-recent-leaves { margin-bottom: 18px; }
        .ap-recent-list { border: 1px solid #e8edf3; border-radius: 10px; overflow: hidden; margin-bottom: 18px; }
        .ap-recent-leave { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 14px; background: #fff; border-bottom: 1px solid #f1f5f9; }
        .ap-recent-leave:last-child { border-bottom: none; }
        .ap-recent-leave div { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .ap-recent-leave strong { font-size: 13.5px; color: #1e293b; }
        .ap-recent-leave span { font-size: 12px; color: #64748b; }

        /* Form */
        .ap-form-grid { display: flex; flex-direction: column; gap: 18px; }
        .ap-form-row  { display: grid; gap: 16px; }
        .ap-col-1 { grid-template-columns: 1fr; }
        .ap-col-2 { grid-template-columns: 1fr 1fr; }
        .ap-col-3 { grid-template-columns: 1fr 1fr 1fr; }
        @media (max-width: 700px) { .ap-col-2, .ap-col-3 { grid-template-columns: 1fr; } }
        .ap-field        { display: flex; flex-direction: column; gap: 6px; }
        .ap-field-center { justify-content: flex-start; }
        .ap-label { font-size: 12.5px; font-weight: 600; color: #475569; }
        .ap-req   { color: #dc2626; }
        .ap-input { font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 9px 12px; outline: none; transition: border .15s, box-shadow .15s; width: 100%; }
        .ap-input:focus  { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,.1); background: #fff; }
        .ap-textarea { resize: vertical; min-height: 80px; }
        .ap-select   { cursor: pointer; }
        .ap-form-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
        .ap-btn-primary  { display: inline-flex; align-items: center; gap: 7px; background: #dc2626; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; transition: background .15s, transform .1s; }
        .ap-btn-primary:hover:not(:disabled)  { background: #b91c1c; }
        .ap-btn-primary:active:not(:disabled) { transform: scale(.98); }
        .ap-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .ap-btn-secondary { display: inline-flex; align-items: center; gap: 7px; background: #f1f5f9; color: #475569; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; padding: 10px 18px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; transition: background .15s; }
        .ap-btn-secondary:hover { background: #e2e8f0; }
        .ap-mini-spinner  { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }

        /* Toggle */
        .ap-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-top: 4px; }
        .ap-toggle input { display: none; }
        .ap-toggle-track { width: 40px; height: 22px; background: #e2e8f0; border-radius: 99px; position: relative; transition: background .2s; flex-shrink: 0; }
        .ap-toggle input:checked + .ap-toggle-track { background: #dc2626; }
        .ap-toggle-thumb { width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
        .ap-toggle input:checked + .ap-toggle-track .ap-toggle-thumb { transform: translateX(18px); }
        .ap-toggle-label { font-size: 13px; color: #475569; font-weight: 500; }

        /* Recurrence UI */
        .ap-recurrence-divider { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; padding: 4px 0 2px; border-top: 1px dashed #e2e8f0; padding-top: 8px; }
        .ap-recurrence-pills   { display: flex; gap: 8px; flex-wrap: wrap; }
        .ap-rpill { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
        .ap-rpill:hover  { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
        .ap-rpill.active { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
        .ap-weekday-grid { display: flex; gap: 6px; flex-wrap: wrap; }
        .ap-wday { width: 46px; height: 40px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
        .ap-wday:hover  { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
        .ap-wday.active { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
        .ap-anchor-preview { display: flex; align-items: flex-start; gap: 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #2563eb; line-height: 1.5; }
        .ap-anchor-preview svg { flex-shrink: 0; margin-top: 1px; }
        .ap-anchor-preview strong { color: #1d4ed8; }

        /* Table */
        .ap-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #e8edf3; }
        .ap-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ap-th { padding: 11px 14px; background: #f8fafc; color: #64748b; font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: .06em; text-align: left; border-bottom: 1px solid #e8edf3; white-space: nowrap; }
        .ap-tr { border-bottom: 1px solid #f1f5f9; transition: background .1s; }
        .ap-tr:last-child { border-bottom: none; }
        .ap-tr:hover { background: #f8fafc; }
        .ap-td { padding: 12px 14px; color: #334155; vertical-align: middle; }
        .ap-td-title { font-weight: 600; color: #1e293b; max-width: 200px; }
        .ap-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; text-transform: capitalize; white-space: nowrap; }
        .ap-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .ap-pill-blue   { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 2px 8px; text-transform: capitalize; }
        .ap-pill-orange { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; color: #d97706; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 2px 8px; }
        .ap-child-badge { display: inline-flex; margin-right: 4px; color: #94a3b8; font-size: 13px; }
        .ap-del-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #94a3b8; transition: background .15s, color .15s, border-color .15s; }
        .ap-del-btn:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .ap-task-mobile-grid { display: none; }
        .ap-task-card-mobile { background: #fff; border: 1px solid #e8edf3; border-left: 4px solid #dc2626; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 10px rgba(15,23,42,.04); }
        .ap-task-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .ap-task-card-title { font-size: 14.5px; font-weight: 700; color: #1e293b; line-height: 1.35; }
        .ap-task-card-sub { font-size: 12px; color: #94a3b8; margin-top: 3px; }
        .ap-task-card-badges { display: flex; flex-wrap: wrap; gap: 6px; }
        .ap-task-card-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ap-task-card-meta div { background: #f8fafc; border: 1px solid #e8edf3; border-radius: 8px; padding: 9px 10px; min-width: 0; }
        .ap-task-card-meta span { display: block; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
        .ap-task-card-meta strong { display: block; font-size: 12.5px; color: #334155; font-weight: 600; overflow-wrap: anywhere; }
        .ap-mobile-pill-muted { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 2px 8px; text-transform: capitalize; }

        /* Leave Requests */
        .ap-leave-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 16px; }
        .ap-leave-card { background: #fff; border: 1px solid #e8edf3; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 11px; transition: box-shadow .15s; }
        .ap-leave-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
        .ap-leave-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .ap-leave-title { font-size: 14.5px; font-weight: 700; color: #1e293b; }
        .ap-leave-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
        .ap-leave-status { display: inline-flex; align-items: center; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; border: 1px solid; white-space: nowrap; }
        .ap-leave-meta { display: flex; flex-wrap: wrap; gap: 6px; }
        .ap-leave-meta span { display: inline-flex; align-items: center; font-size: 11.5px; color: #64748b; background: #f8fafc; border: 1px solid #e8edf3; border-radius: 6px; padding: 3px 8px; }
        .ap-leave-reason { font-size: 12.5px; color: #64748b; line-height: 1.5; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #e2e8f0; }
        .ap-leave-approvals { display: flex; flex-wrap: wrap; gap: 6px; }
        .ap-approval-pill { display: inline-flex; font-size: 11.5px; font-weight: 600; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 3px 8px; }
        .ap-approval-pill.ok { color: #16a34a; background: #f0fdf4; border-color: #bbf7d0; }
        .ap-approval-pill.no { color: #dc2626; background: #fef2f2; border-color: #fecaca; }
        .ap-leave-rejection { font-size: 12px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 7px 10px; line-height: 1.4; }
        .ap-leave-actions { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
        .ap-btn-approve, .ap-btn-reject { display: inline-flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 700; padding: 7px 14px; border-radius: 7px; cursor: pointer; transition: background .15s; border: 1px solid; }
        .ap-btn-approve { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
        .ap-btn-approve:hover:not(:disabled) { background: #dcfce7; }
        .ap-btn-reject { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .ap-btn-reject:hover:not(:disabled) { background: #fee2e2; }
        .ap-btn-approve:disabled, .ap-btn-reject:disabled { opacity: .6; cursor: not-allowed; }
        .ap-saving, .ap-leave-done { font-size: 12px; color: #94a3b8; font-style: italic; }

        /* Shared */
        .op-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; color: #94a3b8; gap: 12px; text-align: center; }
        .op-empty-text  { font-size: 13.5px; }
        .op-spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #dc2626; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Toast */
        .ap-toast { position: fixed; bottom: 28px; right: 28px; z-index: 9999; display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,.15); animation: slideUp .25s ease; }
        .ap-toast-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .ap-toast-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        @media (max-width: 900px) {
          .op-main { padding: 22px 22px 28px; }
          .op-content-card { padding: 22px; border-radius: 12px; }
          .op-profile-card { padding: 20px 22px; align-items: flex-start; }
          .ap-stats-row { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
          .ap-leave-grid { grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); }
        }

        @media (max-width: 760px) {
          .op-body { display: block; min-height: calc(100vh - 60px); }
          .op-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 10020;
            height: 100vh;
            width: min(84vw, 300px);
            min-width: 0;
            border-right: 1px solid #e8edf3;
            transform: translateX(0);
            opacity: 1;
            box-shadow: 12px 0 34px rgba(15,23,42,.18);
            transition: transform .22s ease, opacity .18s ease;
          }
          .op-sidebar.collapsed {
            width: min(84vw, 300px);
            min-width: 0;
            transform: translateX(-105%);
            opacity: 0;
            pointer-events: none;
          }
          .op-sidebar-close { display: inline-flex; }
          .op-sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 10010;
            background: rgba(15,23,42,.38);
            backdrop-filter: blur(2px);
            border: none;
            padding: 0;
          }
          .op-main { padding: 16px 14px 24px; overflow: visible; }
          .op-topbar { margin-bottom: 16px; gap: 10px; }
          .op-toggle-btn { width: 38px; height: 38px; }
          .op-profile-card { margin-bottom: 16px; padding: 16px; border-radius: 10px; gap: 12px; }
          .op-avatar { width: 44px; height: 44px; font-size: 18px; }
          .op-profile-meta { gap: 8px; }
          .op-meta-chip { width: 100%; align-items: flex-start; }
          .op-content-card { padding: 16px; border-radius: 10px; min-height: 240px; }
          .op-content-header { margin-bottom: 16px; padding-bottom: 12px; }
          .ap-stats-row, .ap-leave-summary { grid-template-columns: 1fr; gap: 10px; margin-bottom: 16px; }
          .ap-stat-card { padding: 15px 16px; border-radius: 10px; }
          .ap-stat-value { font-size: 23px; }
          .ap-recent-leave { align-items: flex-start; flex-direction: column; gap: 8px; }
          .ap-form-grid { gap: 14px; }
          .ap-form-actions { justify-content: stretch; flex-direction: column-reverse; }
          .ap-btn-primary, .ap-btn-secondary { width: 100%; justify-content: center; }
          .ap-recurrence-pills { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .ap-rpill { justify-content: center; padding: 9px 10px; }
          .ap-weekday-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); }
          .ap-wday { width: 100%; }
          .ap-table-wrap { display: none; }
          .ap-task-mobile-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
          .ap-task-card-meta { grid-template-columns: 1fr; }
          .ap-leave-grid { grid-template-columns: 1fr; gap: 12px; }
          .ap-leave-card { padding: 16px; border-radius: 10px; }
          .ap-leave-card-top { flex-direction: column; }
          .ap-leave-actions { flex-direction: column; align-items: stretch; }
          .ap-btn-approve, .ap-btn-reject { width: 100%; padding: 9px 14px; }
          .ap-toast { left: 14px; right: 14px; bottom: 16px; justify-content: center; }
        }

        @media (max-width: 380px) {
          .op-main { padding: 12px 10px 20px; }
          .op-content-card, .op-profile-card { padding: 14px; }
          .ap-recurrence-pills { grid-template-columns: 1fr; }
          .ap-weekday-grid { grid-template-columns: repeat(3,minmax(0,1fr)); }
        }
      `}</style>

      <div className="op-root">
        <Navbar />

        {toast && (
          <div className={`ap-toast ap-toast-${toast.type}`}>
            {toast.type === "success"
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            {toast.msg}
          </div>
        )}

        <div className="op-body">
          {sidebarOpen && (
            <button className="op-sidebar-backdrop" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
          )}
          <aside className={`op-sidebar${sidebarOpen ? "" : " collapsed"}`}>
            <div className="op-sidebar-header">
              <span className="op-sidebar-label">Admin Panel</span>
              <button className="op-sidebar-close" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <nav className="op-nav">
              {NAV_ITEMS.map((item) => (
                <button key={item.key} className={`op-nav-item${activeTab === item.key ? " active" : ""}`} onClick={() => handleNavClick(item.key)}>
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                  {item.key === "leave-requests" && leavePendingForAdmin > 0 && (
                    <span className="op-nav-badge">{leavePendingForAdmin}</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          <main className="op-main">
            <div className="op-topbar">
              <button className="op-toggle-btn" onClick={() => setSidebarOpen((p) => !p)} aria-label="Toggle sidebar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <span className="op-page-title">Admin Portal</span>
            </div>

            <div className="op-profile-card">
              <div className="op-avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <div className="op-profile-info">
                <div className="op-profile-name">
                  {user.name}<span className="ap-role-badge">Admin</span>
                </div>
                <div className="op-profile-meta">
                  <span className="op-meta-chip"><strong>Username:</strong> {user.user_name}</span>
                  <span className="op-meta-chip"><strong>Designation:</strong> {user.designation}</span>
                  <span className="op-meta-chip"><strong>Site:</strong> {user.site_name || "Not Assigned"}</span>
                  <span className="op-meta-chip"><strong>Role:</strong> {user.role || "Not Assigned"}</span>
                </div>
              </div>
            </div>

            <div className="op-content-card">
              <div className="op-content-header">
                <div className="op-content-icon">{activeItem?.icon}</div>
                <span className="op-content-title">{activeItem?.label}</span>
              </div>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
