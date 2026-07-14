import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";
import { useRecurringTasks } from "../hooks/useRecurringTasks";
import SiteReport from "./Sitereport";  
import {
  TaskForm as TaskFormWithCheckpoints,
  EMPTY_FORM,
} from "./Taskformwithcheckpoints.jsx";
const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "assign-task",
    label: "Assign Task",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    key: "all-tasks",
    label: "All Tasks",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "recurring-tasks",
    label: "All Recurring Tasks",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
  {
    key: "leave-requests",
    label: "Leave Requests",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "reschedule-requests",
    label: "Reschedule Requests",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    key: "add-employee",
    label: "Add Employee",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    key: "manage-employees",
    label: "Manage Employees",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "add-site",
    label: "Add Site",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="10" height="18" rx="2" />
        <path d="M8 7h2M8 11h2M8 15h2" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </svg>
    ),
  },
  {
    key: "manage-sites",
    label: "Manage Sites",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="7" height="16" rx="1" />
        <rect x="14" y="8" width="7" height="12" rx="1" />
        <path d="M6 8h1M6 12h1M6 16h1" />
        <path d="M17 12h1M17 16h1" />
      </svg>
    ),
  },
  
];
const REPORTS_NAV = [
{
  key: "add-drawings",
  label: "Add Drawings",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="12" height="14" rx="1"/>
      <path d="M6 9h6M6 12h6M6 15h4"/>
      <path d="M16 16l5-5 2 2-5 5-3 1z"/>
    </svg>
  ),
},
{
  key: "all-drawings",
  label: "All Drawings",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <path d="M3 9h18"/>
      <path d="M9 3v18"/>
      <path d="M15 3v18"/>
      <path d="M3 15h18"/>
    </svg>
  ),
},
  {
    key: "site-report",
    label: "Site Report",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    key: "svr-reports",
    label: "SVR Reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l5 5v3" />
        <polyline points="14 3 14 8 19 8" />
        <path d="M12 22l2 2 4-4" />
      </svg>
    ),
  },
    
];
const TICKETS_NAV = [
{
  key: "new-tickets",
  label: "New Tickets",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7z" />
      <path d="M12 7v10" strokeDasharray="2 2" />
    </svg>
  ),
},
{
  key: "solved-ticket",
  label: "Solved Tickets",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
}
];
const VERIFICATION_NAV = [
{
  key: "pending-verification",
  label: "Pending Verification",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2h12" />
      <path d="M6 22h12" />
      <path d="M8 2v4l4 4 4-4V2" />
      <path d="M8 22v-4l4-4 4 4v4" />
    </svg>
  ),
},
{
  key: "approved-verification",
  label: "Approved Tasks",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  ),
},
{
  key: "rejected-verification",
  label: "Rejected Tasks",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6" />
      <path d="M15 9l-6 6" />
    </svg>
  ),
},
{
  key: "overdue-tasks",
  label: "Overdue Tasks",
  icon: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
      <path d="M19 5l2-2" />
    </svg>
  ),
}
];
const PRIORITY_STYLES = {
  high: { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
  medium: { bg: "#fffbeb", color: "#d97706", dot: "#d97706" },
  low: { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
};

const STATUS_STYLES = {
  pending: { bg: "#f1f5f9", color: "#64748b" },
  in_progress: { bg: "#eff6ff", color: "#2563eb" },
  completed: { bg: "#f0fdf4", color: "#16a34a" },
};

const LEAVE_STATUS_STYLES = {
  pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  approved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EMPTY_TASK_FILTERS = {
  dateFrom: "",
  dateTo: "",
  assignedTo: "",
  site: "",
  priority: "",
  status: "",
};
// ── helpers ────────────────────────────────────────────────────────────────
function daysInMonth(month) {
  return new Date(2001, parseInt(month, 10), 0).getDate();
}
function nameFor(userMap, username) {
  return userMap[username] || username || "—";
}
function buildAnchor(form) {
  switch (form.recurrence) {
    case "daily":
      return null;
    case "weekly":
      return String(form.anchor_weekday);
    case "monthly":
      return String(form.anchor_day);
    case "yearly":
      return `${String(form.anchor_month).padStart(2, "0")}-${String(form.anchor_month_day).padStart(2, "0")}`;
    default:
      return null;
  }
}

function anchorDescription(recurrence, anchor) {
  if (!anchor) return null;
  switch (recurrence) {
    case "weekly":
      return `every ${WEEKDAYS[parseInt(anchor, 10)]}`;
    case "monthly":
      return `on the ${anchor}${ordinal(parseInt(anchor, 10))} of every month`;
    case "yearly": {
      const [mm, dd] = anchor.split("-");
      return `every year on ${MONTHS[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;
    }
    default:
      return null;
  }
}
const APPROVAL_SLOT_LABELS = {
  level: "Level Approver",
  head: "Site Head",
  admin: "Admin",
  proxy: "Proxy Approver",
};

function slotLabel(slot) {
  return APPROVAL_SLOT_LABELS[slot] || slot;
}
function ordinal(n) {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function computeLeaveStatus(leave) {
  const storedStatus = normalizeText(leave.status);
  if (
    leave.admin_approved === false ||
    leave.proxy_approved === false ||
    storedStatus === "rejected"
  )
    return "rejected";
  const proxyDone = !leave.proxy_user_name || leave.proxy_approved === true;
  if (
    (leave.admin_approved === true || storedStatus === "approved") &&
    proxyDone
  )
    return "approved";
  return "pending";
}

function formatLeaveDate(date) {
  return date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";
}

function getLeaveDays(leave) {
  if (!leave.from_date || !leave.to_date) return null;
  return (
    Math.ceil(
      (new Date(leave.to_date) - new Date(leave.from_date)) /
        (1000 * 60 * 60 * 24),
    ) + 1
  );
}

function buildDownloadUrl(url, filename) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}download=${encodeURIComponent(filename || "report.pdf")}`;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isSiteEngineerLeave(leave) {
  return [
    leave.role,
    leave.designation,
    leave.user_role,
    leave.user_designation,
  ]
    .map(normalizeText)
    .some((value) => value === "site engineer" || value === "site_engineer");
}

function getHeadApprovalText(leave) {
  const storedStatus = normalizeText(leave.status);
  const headName = leave.proxy_user_name || leave.head_user_names;
  if (leave.proxy_approved === true || storedStatus === "approved")
    return "Head: Approved";
  if (leave.proxy_approved === false || storedStatus === "rejected")
    return "Head: Rejected";
  return headName ? `Head (${headName}): Pending` : "Head: Pending";
}

function getHeadApprovalClass(leave) {
  const storedStatus = normalizeText(leave.status);
  if (leave.proxy_approved === true || storedStatus === "approved") return "ok";
  if (leave.proxy_approved === false || storedStatus === "rejected")
    return "no";
  return "";
}

function isFinalLeaveStatus(leave) {
  const storedStatus = normalizeText(leave.status);
  return storedStatus === "approved" || storedStatus === "rejected";
}

function applyTaskFilters(tasks, filters) {
  return tasks.filter((t) => {
    if (filters.assignedTo && t.assigned_to !== filters.assignedTo)
      return false;
    if (filters.site && t.site_name !== filters.site) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.dateFrom && t.due_date && t.due_date < filters.dateFrom)
      return false;
    if (filters.dateTo && t.due_date && t.due_date > filters.dateTo)
      return false;
    return true;
  });
}

function getNextDueDate(task) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const anchor = task.recurrence_anchor;
  const rec = task.recurrence;

  switch (rec) {
    case "daily": {
      const d = new Date(today);
      return d;
    }
    case "weekly": {
      const targetDay = parseInt(anchor, 10); // 0–6
      const d = new Date(today);
      const diff = (targetDay - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
      return d;
    }
    case "monthly": {
      const day = parseInt(anchor, 10);
      const d = new Date(today.getFullYear(), today.getMonth(), day);
      if (d <= today) d.setMonth(d.getMonth() + 1);
      return d;
    }
    case "yearly": {
      if (!anchor) return null;
      const [mm, dd] = anchor.split("-").map(Number);
      const d = new Date(today.getFullYear(), mm - 1, dd);
      if (d <= today) d.setFullYear(d.getFullYear() + 1);
      return d;
    }
    default:
      return null;
  }
}

function formatNextDue(date) {
  if (!date) return "—";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date - today) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (diff === 0)
    return { label, badge: "Today", color: "#dc2626", bg: "#fef2f2" };
  if (diff === 1)
    return { label, badge: "Tomorrow", color: "#d97706", bg: "#fffbeb" };
  if (diff <= 7)
    return { label, badge: `In ${diff} days`, color: "#2563eb", bg: "#eff6ff" };
  return { label, badge: null };
}
// ── Task Filter Bar ────────────────────────────────────────────────────────
function TaskFilterBar({
  filters,
  onChange,
  onClear,
  sites,
  priorities,
  statuses,
  assignees,
  inline,
  mobileOpen,
  onMobileToggle,
}) {
  const isActive = Object.values(filters).some((v) => v !== "");

  const fields = (
    <>
      <div className="tf-group">
        <span className="tf-label">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Due
        </span>
        <input
          className="tf-input tf-date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange("dateFrom", e.target.value)}
          title="From"
        />
        <span className="tf-sep-text">–</span>
        <input
          className="tf-input tf-date"
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom}
          onChange={(e) => onChange("dateTo", e.target.value)}
          title="To"
        />
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <select
          className="tf-select"
          value={filters.assignedTo}
          onChange={(e) => onChange("assignedTo", e.target.value)}
        >
          <option value="">All users</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      {sites.length > 0 && (
        <>
          <div className="tf-divider" />
          <div className="tf-group">
            <select
              className="tf-select"
              value={filters.site}
              onChange={(e) => onChange("site", e.target.value)}
            >
              <option value="">All sites</option>
              {sites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <div className="tf-divider" />
      <div className="tf-group">
        <select
          className="tf-select"
          value={filters.priority}
          onChange={(e) => onChange("priority", e.target.value)}
        >
          <option value="">All priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <select
          className="tf-select"
          value={filters.status}
          onChange={(e) => onChange("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
      {isActive && (
        <button className="tf-clear" onClick={onClear}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}
    </>
  );

  if (inline) {
    return (
      <>
        <div className="tf-bar-inline">{fields}</div>
        <div
          style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}
        >
          <button
            className={`tf-mobile-btn${mobileOpen ? " Active" : ""}`}
            onClick={onMobileToggle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {isActive && <span className="tf-mobile-badge" />}
          </button>
          {mobileOpen && (
            <div className="tf-popup">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return <div className="tf-bar tf-bar-fixed">{fields}</div>;
}
// ── sub-components ─────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="ap-stat-card" style={{ borderTopColor: accent }}>
      <div
        className="ap-stat-icon"
        style={{ background: accent + "18", color: accent }}
      >
        {icon}
      </div>
      <div className="ap-stat-body">
        <div className="ap-stat-value">{value}</div>
        <div className="ap-stat-label">{label}</div>
      </div>
    </div>
  );
}

function TaskRow({ task, onDelete, userMap, onClick }) {
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const s = STATUS_STYLES[task.status] || STATUS_STYLES.pending;
  return (
    <tr
      className="ap-tr"
      onClick={() => onClick?.(task)}
      style={{ cursor: "pointer" }}
    >
      <td className="ap-td ap-td-title">
        {task.parent_task_id && (
          <span className="ap-child-badge" title="Auto-generated instance">
            ↳
          </span>
        )}
        {task.title}
        <div
          style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}
        >
          {task.audio_url && (
            <a
              href={task.audio_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: "#7c3aed",
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
                borderRadius: 5,
                padding: "2px 7px",
                textDecoration: "none",
              }}
              title="Play audio instruction"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              Audio
            </a>
          )}
          {task.document_url && (
            <a
              href={task.document_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: "#0369a1",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 5,
                padding: "2px 7px",
                textDecoration: "none",
              }}
              title="View document"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Doc
            </a>
          )}
        </div>
      </td>
      <td className="ap-td">{nameFor(userMap, task.assigned_to)}</td>
      <td className="ap-td">{task.site_name || "—"}</td>
      <td className="ap-td">{nameFor(userMap, task.assigned_by)}</td>
      <td className="ap-td">
        <span className="ap-badge" style={{ background: p.bg, color: p.color }}>
          <span className="ap-badge-dot" style={{ background: p.dot }} />
          {task.priority}
        </span>
      </td>
      <td className="ap-td">
        <span className="ap-badge" style={{ background: s.bg, color: s.color }}>
          {task.status?.replace("_", " ")}
        </span>
      </td>
      <td className="ap-td">
        {task.due_date
          ? new Date(task.due_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="ap-td">
        {task.is_recurring ? (
          <span className="ap-pill-blue">
            {anchorDescription(task.recurrence, task.recurrence_anchor) ||
              task.recurrence}
          </span>
        ) : task.parent_task_id ? (
          <span className="ap-pill-orange">instance</span>
        ) : (
          <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
        )}
      </td>
      <td className="ap-td" onClick={(e) => e.stopPropagation()}>
        <button
          className="ap-del-btn"
          onClick={() => onDelete(task.id)}
          title="Delete"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

function RecurringTaskCard({ task, next, p, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="ap-task-card-mobile"
      onClick={() => setExpanded((e) => !e)}
      style={{ cursor: "pointer" }}
    >
      {/* Compact header — always visible */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ap-task-card-title" style={{ marginBottom: 5 }}>
            {task.title}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              alignItems: "center",
            }}
          >
            <span
              className="ap-badge"
              style={{ background: p.bg, color: p.color }}
            >
              <span className="ap-badge-dot" style={{ background: p.dot }} />
              {task.priority}
            </span>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
              {task.assigned_to}
            </span>
            {next?.label && (
              <span
                style={{ fontSize: 11.5, color: "#64748b", marginLeft: "auto" }}
              >
                {next.label}
                {next.badge && (
                  <span
                    style={{
                      marginLeft: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      background: next.bg,
                      color: next.color,
                      borderRadius: 20,
                      padding: "1px 5px",
                    }}
                  >
                    {next.badge}
                  </span>
                )}
              </span>
            )}
          </div>
          {(task.audio_url || task.document_url) && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 10.5,
                fontWeight: 600,
                color: "#94a3b8",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: 4,
                padding: "1px 5px",
                marginTop: 5,
              }}
            >
              📎{" "}
              {[task.audio_url && "audio", task.document_url && "doc"]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            className="ap-del-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
          <button
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div className="ap-task-card-badges">
            <span className="ap-pill-blue">
              {anchorDescription(task.recurrence, task.recurrence_anchor) ||
                task.recurrence}
            </span>
          </div>
          <div className="ap-task-card-meta">
            <div>
              <span>Site</span>
              <strong>{task.site_name || "Not assigned"}</strong>
            </div>
            <div>
              <span>Next Due</span>
              <strong>
                {next?.label || "—"}
                {next?.badge && (
                  <span
                    style={{
                      marginLeft: 5,
                      fontSize: 10,
                      fontWeight: 700,
                      background: next.bg,
                      color: next.color,
                      borderRadius: 20,
                      padding: "1px 6px",
                    }}
                  >
                    {next.badge}
                  </span>
                )}
              </strong>
            </div>
          </div>
          {task.description && (
            <div
              style={{
                fontSize: 12.5,
                color: "#64748b",
                background: "#f8fafc",
                borderRadius: 6,
                padding: "8px 10px",
                borderLeft: "3px solid #e2e8f0",
                lineHeight: 1.5,
              }}
            >
              {task.description}
            </div>
          )}
          {(task.audio_url || task.document_url) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {task.audio_url && (
                <a
                  href={task.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#7c3aed",
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    borderRadius: 7,
                    padding: "6px 12px",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Audio Instruction
                </a>
              )}
              {task.document_url && (
                <a
                  href={task.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#0369a1",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 7,
                    padding: "6px 12px",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Document
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function TaskCard({ task, onDelete, onOpenDetail }) {
  const [expanded, setExpanded] = useState(false);
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const s = STATUS_STYLES[task.status] || STATUS_STYLES.pending;

  return (
    <div className="ap-task-card-mobile">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{ flex: 1, minWidth: 0 }}
          onClick={() => onOpenDetail?.(task)}
          style={{ cursor: "pointer" }}
        >
          <div className="ap-task-card-title" style={{ marginBottom: 5 }}>
            {task.parent_task_id && <span className="ap-child-badge">↳</span>}
            {task.title}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              alignItems: "center",
            }}
          >
            <span
              className="ap-badge"
              style={{ background: p.bg, color: p.color }}
            >
              <span className="ap-badge-dot" style={{ background: p.dot }} />
              {task.priority}
            </span>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
              {task.assigned_to || "Unassigned"}
            </span>
            {task.due_date && (
              <span
                style={{ fontSize: 11.5, color: "#64748b", marginLeft: "auto" }}
              >
                {new Date(task.due_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
            {(task.audio_url || task.document_url) && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "#94a3b8",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                📎{" "}
                {[task.audio_url && "audio", task.document_url && "doc"]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            className="ap-del-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
          <button
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              transition: "transform .2s",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div className="ap-task-card-badges">
            <span
              className="ap-badge"
              style={{ background: s.bg, color: s.color }}
            >
              {task.status?.replace("_", " ")}
            </span>
            {task.is_recurring ? (
              <span className="ap-pill-blue">
                {anchorDescription(task.recurrence, task.recurrence_anchor) ||
                  task.recurrence}
              </span>
            ) : task.parent_task_id ? (
              <span className="ap-pill-orange">instance</span>
            ) : (
              <span className="ap-mobile-pill-muted">one-time</span>
            )}
          </div>
          <div className="ap-task-card-meta">
            <div>
              <span>Site</span>
              <strong>{task.site_name || "Not assigned"}</strong>
            </div>
            <div>
              <span>Due Date</span>
              <strong>
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not set"}
              </strong>
            </div>
          </div>
          {task.description && (
            <div
              style={{
                fontSize: 12.5,
                color: "#64748b",
                background: "#f8fafc",
                borderRadius: 6,
                padding: "8px 10px",
                borderLeft: "3px solid #e2e8f0",
                lineHeight: 1.5,
              }}
            >
              {task.description}
            </div>
          )}
          {(task.audio_url || task.document_url) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {task.audio_url && (
                <a
                  href={task.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#7c3aed",
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    borderRadius: 7,
                    padding: "6px 12px",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Audio Instruction
                </a>
              )}
              {task.document_url && (
                <a
                  href={task.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#0369a1",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 7,
                    padding: "6px 12px",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Document
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function formatAuditEntries(value, roleByName = {}) {
  if (value == null || value === "") return null;

  const renderEntry = (entry, key) => {
    if (typeof entry === "string") return <div key={key}>{entry}</div>;
    const { by, slot, reason, at } = entry || {};
    const dateStr = at
      ? new Date(at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;
    const roleLabel = roleByName[by];
    return (
      <div key={key} style={{ marginBottom: 6 }}>
        <strong>{by || "Unknown"}</strong>
        {roleLabel ? (
          <span style={{ color: "#94a3b8" }}> ({roleLabel})</span>
        ) : slot ? (
          <span style={{ color: "#94a3b8" }}> ({slotLabel(slot)})</span>
        ) : null}
        {reason && <>: {reason}</>}
        {dateStr && (
          <span style={{ color: "#94a3b8", fontSize: 11 }}> — {dateStr}</span>
        )}
      </div>
    );
  };

  // already a plain string — could be plain text, or a stringified JSON array
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return <>{parsed.map((entry, i) => renderEntry(entry, i))}</>;
      }
      if (parsed && typeof parsed === "object")
        return renderEntry(parsed, "single");
    } catch {
      return value;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return <>{value.map((entry, i) => renderEntry(entry, i))}</>;
  }

  if (typeof value === "object") {
    return renderEntry(value, "single");
  }

  return String(value);
}
function displayReason(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return (
      <>
        {value.reason}
        {value.by && (
          <span style={{ color: "#94a3b8" }}> — requested by {value.by}</span>
        )}
      </>
    );
  }
  return "";
}
function LeaveStatusBadge({ leave }) {
  const status = computeLeaveStatus(leave);
  const style = LEAVE_STATUS_STYLES[status];
  return (
    <span
      className="ap-leave-status"
      style={{
        background: style.bg,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LeaveRequestCard({ leave, onAction, updating, roleByName }) {
  const status = computeLeaveStatus(leave);
  const days = getLeaveDays(leave);
  const managedByHead = isSiteEngineerLeave(leave);
  const canAct =
    !managedByHead &&
    (leave.admin_approved === null || leave.admin_approved === undefined) &&
    !isFinalLeaveStatus(leave);

  return (
    <div
      className="ap-leave-card"
      style={{
        borderLeftColor:
          status === "approved"
            ? "#16a34a"
            : status === "rejected"
              ? "#dc2626"
              : "#f59e0b",
      }}
    >
      <div className="ap-leave-card-top">
        <div>
          <div className="ap-leave-title">
            {leave.name || leave.user_name || "Employee"}
          </div>
          <div className="ap-leave-sub">
            {leave.user_name || "No username"}
            {leave.site_name ? ` - ${leave.site_name}` : ""}
          </div>
        </div>
        <LeaveStatusBadge leave={leave} />
      </div>
      <div className="ap-leave-meta">
        {(leave.role || leave.designation) && (
          <span>{leave.role || leave.designation}</span>
        )}
        <span>{leave.leave_type || "Leave"}</span>
        <span>
          {formatLeaveDate(leave.from_date)} to {formatLeaveDate(leave.to_date)}
        </span>
        {days && (
          <span>
            {days} day{days > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {leave.reason && (
        <p className="ap-leave-reason">
          {formatAuditEntries(leave.reason, roleByName)}
        </p>
      )}
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
              <span
                className={`ap-approval-pill ${leave.proxy_approved === true ? "ok" : leave.proxy_approved === false ? "no" : ""}`}
              >
                Proxy ({leave.proxy_user_name}):{" "}
                {leave.proxy_approved === true
                  ? "Accepted"
                  : leave.proxy_approved === false
                    ? "Declined"
                    : "Pending"}
              </span>
            ) : leave.admin_approved === null ||
              leave.admin_approved === undefined ? (
              <span className="ap-approval-pill">Admin: Pending</span>
            ) : null}
          </>
        )}
      </div>
      {leave.rejection_reason && (
        <div className="ap-leave-rejection">
          {formatAuditEntries(leave.rejection_reason, roleByName)}
        </div>
      )}
      {canAct ? (
        <div className="ap-leave-actions">
          <button
            className="ap-btn-approve"
            disabled={updating === leave.id}
            onClick={() => onAction(leave, true)}
          >
            Approve
          </button>
          <button
            className="ap-btn-reject"
            disabled={updating === leave.id}
            onClick={() => onAction(leave, false)}
          >
            Reject
          </button>
          {updating === leave.id && (
            <span className="ap-saving">saving...</span>
          )}
        </div>
      ) : managedByHead ? (
        <div className="ap-leave-done">
          Managed by site head - admin can view status only.
        </div>
      ) : (
        <div className="ap-leave-done">Admin decision already submitted.</div>
      )}
    </div>
  );
}

// ── Shared task form JSX (used in both assign-task tab and modal) ───────────
function TaskForm({
  form,
  handleFormChange,
  setForm,
  handleSubmit,
  submitting,
  onSuccess,
  employees,
  sites = [],
}) {
  const liveAnchor = form.is_recurring ? buildAnchor(form) : null;
  const anchorPreview =
    form.is_recurring && form.recurrence
      ? anchorDescription(form.recurrence, liveAnchor)
      : null;
  const monthDays = daysInMonth(form.anchor_month);

  return (
    <div className="ap-form-grid">
      <div className="ap-field">
        <label className="ap-label">
          Assign To <span className="ap-req">*</span>
        </label>
        <select
          className="ap-input ap-select"
          name="assigned_to"
          value={form.assigned_to}
          onChange={handleFormChange}
        >
          <option value="">Select employee…</option>
          {employees
            .filter((e) => e.status !== "Inactive") // optional: hide inactive staff
            .map((e) => (
              <option key={e.username} value={e.username}>
                {e.name}
              </option>
            ))}
        </select>
      </div>
      <div className="ap-form-row ap-col-2">
        <div className="ap-field ap-field-center">
          <label className="ap-label">Reschedule Request</label>
          <label className="ap-toggle">
            <input
              type="checkbox"
              name="reschedule_allowed"
              checked={form.reschedule_allowed || false}
              onChange={handleFormChange}
            />
            <span className="ap-toggle-track">
              <span className="ap-toggle-thumb" />
            </span>
            <span className="ap-toggle-label">
              {form.reschedule_allowed
                ? "Yes — employee can request reschedule"
                : "No"}
            </span>
          </label>
        </div>
      </div>
      {/* Audio attachment */}
      <div className="ap-form-row ap-col-2">
        <div className="ap-field">
          <label className="ap-label">
            Audio Instruction
            <span
              className="ap-optional"
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#94a3b8",
                background: "#f1f5f9",
                borderRadius: 4,
                padding: "1px 6px",
                marginLeft: 6,
              }}
            >
              optional
            </span>
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <input
              type="file"
              accept="audio/*"
              style={{
                flex: 1,
                fontSize: 12.5,
                color: "#475569",
                background: "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
              }}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  _audioFile: e.target.files[0] || null,
                }))
              }
            />
          </div>
          {form._audioFile && (
            <span style={{ fontSize: 11.5, color: "#16a34a" }}>
              ✓ {form._audioFile.name}
            </span>
          )}
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
            MP3, WAV, M4A supported. Max 50MB.
          </span>
        </div>

        <div className="ap-field">
          <label className="ap-label">
            Document Attachment
            <span
              className="ap-optional"
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#94a3b8",
                background: "#f1f5f9",
                borderRadius: 4,
                padding: "1px 6px",
                marginLeft: 6,
              }}
            >
              optional
            </span>
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
              style={{
                flex: 1,
                fontSize: 12.5,
                color: "#475569",
                background: "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
              }}
              onChange={(e) =>
                setForm((p) => ({ ...p, _docFile: e.target.files[0] || null }))
              }
            />
          </div>
          {form._docFile && (
            <span style={{ fontSize: 11.5, color: "#16a34a" }}>
              ✓ {form._docFile.name}
            </span>
          )}
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
            PDF, Word, Excel, images supported. Max 20MB.
          </span>
        </div>
      </div>
      <div className="ap-form-row ap-col-1">
        <div className="ap-field">
          <label className="ap-label">Description</label>
          <textarea
            className="ap-input ap-textarea"
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Add task details, instructions, or notes…"
            rows={3}
          />
        </div>
      </div>
      <div className="ap-form-row ap-col-3">
        <div className="ap-field">
          <label className="ap-label">Site Name</label>
          <select
            className="ap-input ap-select"
            name="site_name"
            value={form.site_name}
            onChange={handleFormChange}
          >
            <option value="">Select site…</option>
            {sites.map((s) => (
              <option key={s.id} value={s.site_name}>
                {s.site_name}
              </option>
            ))}
          </select>
        </div>
        <div className="ap-field">
          <label className="ap-label">Priority</label>
          <select
            className="ap-input ap-select"
            name="priority"
            value={form.priority}
            onChange={handleFormChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="ap-field">
          <label className="ap-label">Initial Status</label>
          <select
            className="ap-input ap-select"
            name="status"
            value={form.status}
            onChange={handleFormChange}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="ap-form-row ap-col-2">
        <div className="ap-field">
          <label className="ap-label">Start / Due Date</label>
          <input
            className="ap-input"
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleFormChange}
          />
        </div>
        <div className="ap-field ap-field-center">
          <label className="ap-label">Recurring Task</label>
          <label className="ap-toggle">
            <input
              type="checkbox"
              name="is_recurring"
              checked={form.is_recurring}
              onChange={handleFormChange}
            />
            <span className="ap-toggle-track">
              <span className="ap-toggle-thumb" />
            </span>
            <span className="ap-toggle-label">
              {form.is_recurring ? "Yes" : "No"}
            </span>
          </label>
        </div>
      </div>
      {form.is_recurring && (
        <>
          <div className="ap-recurrence-divider">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Recurrence Schedule
          </div>
          <div className="ap-form-row ap-col-2">
            <div className="ap-field">
              <label className="ap-label">
                Recurrence Pattern <span className="ap-req">*</span>
              </label>
              <div className="ap-recurrence-pills">
                {["daily", "weekly", "monthly", "yearly"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`ap-rpill${form.recurrence === r ? " Active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, recurrence: r }))}
                  >
                    {r === "daily" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                      </svg>
                    )}
                    {r === "weekly" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                    {r === "monthly" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="12" y1="14" x2="12" y2="18" />
                      </svg>
                    )}
                    {r === "yearly" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    )}
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {form.recurrence === "weekly" && (
            <div className="ap-form-row ap-col-1">
              <div className="ap-field">
                <label className="ap-label">Repeat on which day?</label>
                <div className="ap-weekday-grid">
                  {WEEKDAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      className={`ap-wday${String(form.anchor_weekday) === String(i) ? " Active" : ""}`}
                      onClick={() =>
                        setForm((p) => ({ ...p, anchor_weekday: String(i) }))
                      }
                    >
                      {day.slice(0, 3)}
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
                <select
                  className="ap-input ap-select"
                  name="anchor_day"
                  value={form.anchor_day}
                  onChange={handleFormChange}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                      {ordinal(d)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {form.recurrence === "yearly" && (
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Month</label>
                <select
                  className="ap-input ap-select"
                  name="anchor_month"
                  value={form.anchor_month}
                  onChange={handleFormChange}
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Day</label>
                <select
                  className="ap-input ap-select"
                  name="anchor_month_day"
                  value={form.anchor_month_day}
                  onChange={handleFormChange}
                >
                  {Array.from({ length: monthDays }, (_, i) => i + 1).map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                        {ordinal(d)}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          )}
          {anchorPreview && (
            <div className="ap-anchor-preview">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              This task will auto-generate a new instance{" "}
              <strong>{anchorPreview}</strong>. If the previous instance is
              still pending, a warning note will be added.
            </div>
          )}
        </>
      )}
      <div className="ap-form-row ap-col-1 ap-form-actions">
        <button
          className="ap-btn-secondary"
          onClick={() => setForm({ ...EMPTY_FORM })}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
        <button
          className="ap-btn-primary"
          onClick={async () => {
            const ok = await handleSubmit();
            if (ok && onSuccess) onSuccess();
          }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="ap-mini-spinner" /> Assigning…
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>{" "}
              Assign Task
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const RESCHED_STATUS_STYLES = {
  pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  approved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};
function toTitleCase(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function slugify(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function generateJobNo(siteName, existingSites) {
  let maxNum = 0;
  (existingSites || []).forEach((s) => {
    const m = /^DIP-(\d+)\|/.exec(s.job_no || "");
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  });
  const nextNum = String(maxNum + 1).padStart(3, "0");
  const year = new Date().getFullYear();
  const cleanName = (siteName || "").replace(/\s+/g, "");
  return `DIP-${nextNum}|${year}|${cleanName}`;
}

async function uploadSiteImage(supabaseClient, siteName, file) {
  const bucket = slugify(siteName);
  if (!bucket) throw new Error("Enter a site name before uploading an image.");

  const { error: bucketErr } = await supabaseClient.storage.createBucket(
    bucket,
    {
      public: true,
    },
  );
  if (bucketErr && !/already exists/i.test(bucketErr.message || "")) {
    throw new Error(
      `Could not create bucket "${bucket}": ${bucketErr.message}`,
    );
  }

  const ext = file.name.split(".").pop();
  const path = `SiteImg/site_title.${ext}`;
  const { error: upErr } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;

  const { data: urlData } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(path);
  return urlData.publicUrl;
}
function RescheduleRequestCard({ req, onAction, updating, roleByName }) {
  const ss = RESCHED_STATUS_STYLES[req.status] || RESCHED_STATUS_STYLES.pending;
  const fmtDate = (d) =>
    d
      ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const taskTitle = req.tasks?.title || `Task #${req.task_id}`;
  const siteName = req.tasks?.site_name;

  return (
    <div
      className="ap-leave-card"
      style={{
        borderLeftColor:
          req.status === "approved"
            ? "#16a34a"
            : req.status === "rejected"
              ? "#dc2626"
              : "#f59e0b",
      }}
    >
      <div className="ap-leave-card-top">
        <div>
          <div className="ap-leave-title">{req.requested_by}</div>
          <div className="ap-leave-sub">
            Task: <strong>{taskTitle}</strong>
            {siteName && ` · ${siteName}`}
          </div>
        </div>
        <span
          className="ap-leave-status"
          style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}
        >
          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
        </span>
      </div>

      <div className="ap-leave-meta">
        <span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 3 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Current: {fmtDate(req.current_due)}
        </span>
        <span
          style={{
            color: "#2563eb",
            background: "#eff6ff",
            borderColor: "#bfdbfe",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 3 }}
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Requested: {fmtDate(req.requested_date)}
        </span>
        <span>
          {new Date(req.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {req.reason && (
        <p className="ap-leave-reason">
          {formatAuditEntries(req.reason, roleByName)}
        </p>
      )}
      {req.admin_note && (
        <div className="ap-leave-rejection">
          {formatAuditEntries(req.admin_note, roleByName)}
        </div>
      )}

      {req.status === "pending" ? (
        <div className="ap-leave-actions">
          <button
            className="ap-btn-approve"
            disabled={updating === req.id}
            onClick={() => onAction(req, true)}
          >
            Approve & Update Due Date
          </button>
          <button
            className="ap-btn-reject"
            disabled={updating === req.id}
            onClick={() => onAction(req, false)}
          >
            Reject
          </button>
          {updating === req.id && <span className="ap-saving">saving…</span>}
        </div>
      ) : (
        <div className="ap-leave-done">
          {req.status === "approved"
            ? `✓ Approved by ${req.actioned_by} — due date updated to ${fmtDate(req.requested_date)}`
            : `✗ Rejected by ${req.actioned_by}`}
        </div>
      )}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [allReschedules, setAllReschedules] = useState([]);
  const [loadingReschedules, setLoadingReschedules] = useState(false);
  const [updatingRescheduleId, setUpdatingRescheduleId] = useState(null);
  const [recurringMobileFilterOpen, setRecurringMobileFilterOpen] =
    useState(false);
  const [showRecurringInAllTasks, setShowRecurringInAllTasks] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth > 760,
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null); // holds employee object when editing
  const [empForm, setEmpForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
    department: "",
    site_name: "",
    site_names: [],
    status: "Active",
  });
  const [empSubmitting, setEmpSubmitting] = useState(false);
const [mySvrReports, setMySvrReports] = useState([]);
const [loadingSvrReports, setLoadingSvrReports] = useState(false);

const fetchMySvrReports = useCallback(async (u) => {
  if (!u) return;
  setLoadingSvrReports(true);
const { data, error } = await supabase
  .from("site_reports")
  .select(
    "id, site_name, reporter_name, designation, visit_date, visit_time, progress_of_work, quality_observations, safety_concerns, issues_concerns, site_visit_instructions, key_instructions, submitted_by, submitted_by_name, pdf_url, created_at",
  )
  .eq("submitted_by", u.user_name)   // ✅ matches what's actually stored
  .order("created_at", { ascending: false });
  if (!error) setMySvrReports(data || []);
  setLoadingSvrReports(false);
}, []);
  const EMPTY_SITE_FORM = {
    site_name: "",
    user_name: "",
    role: "",
    job_no: "",
    started_date: "",
    client_name: "",
    head_name: "",
    site_image_url: "",
    incharge_name: "",
    head_contact_no: "",
    incharge_contact_no: "",
    pc_name: "",
    pc_contact_no: "",
    status: "Active",
    _imageFile: null,
  };
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [siteForm, setSiteForm] = useState({ ...EMPTY_SITE_FORM });
  const [siteSubmitting, setSiteSubmitting] = useState(false);
  const [uploadingSiteImage, setUploadingSiteImage] = useState(false);

  useEffect(() => {
    if (editingSite) return;
    if (!siteForm.site_name.trim()) return;
    setSiteForm((p) => ({ ...p, job_no: generateJobNo(p.site_name, sites) }));
  }, [siteForm.site_name, sites, editingSite]);

  const regenerateJobNo = () => {
    setSiteForm((p) => ({ ...p, job_no: generateJobNo(p.site_name, sites) }));
  };

  const [allTasks, setAllTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [updatingLeaveId, setUpdatingLeaveId] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Task filters
  const [taskFilters, setTaskFilters] = useState({ ...EMPTY_TASK_FILTERS });
  const total = allTasks.length;
  const roleByName = employees.reduce(
    (map, e) => ({ ...map, [e.name]: e.role }),
    {},
  );
  
const assignableEmployees = employees.filter((e) =>
  ["site engineer", "engineer office"].includes(normalizeText(e.department)),
);
  const EMPTY_RECURRING_FILTERS = {
    dueSoon: false,
    site: "",
    assignedTo: "",
    recurrence: "",
  };
  const [recurringFilters, setRecurringFilters] = useState({
    ...EMPTY_RECURRING_FILTERS,
  });
  const [userMap, setUserMap] = useState({});
  useEffect(() => {
    supabase
      .from("user_details")
      .select("username, name")
      .then(({ data, error }) => {
        if (!error && data) {
          const map = {};
          data.forEach((u) => {
            map[u.username] = u.name;
          });
          setUserMap(map);
        }
      });
  }, []);

  const [detailTask, setDetailTask] = useState(null);
  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);

  const fetchAllTasks = useCallback(async () => {
    setLoadingTasks(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    setAllTasks(data || []);
    setLoadingTasks(false);
  }, []);

  const fetchAllReschedules = useCallback(async () => {
    setLoadingReschedules(true);
    const { data } = await supabase
      .from("reschedule_requests")
      .select("*, tasks(title, site_name)")
      .order("created_at", { ascending: false });
    setAllReschedules(data || []);
    setLoadingReschedules(false);
  }, []);

  const fetchAllLeaves = useCallback(async () => {
    setLoadingLeaves(true);
    const { data, error } = await supabase
      .from("leaves")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      showToast("error", "Failed to load leaves. " + error.message);
    } else {
      const leaves = data || [];
      const userNames = [
        ...new Set(leaves.map((l) => l.user_name).filter(Boolean)),
      ];
      let siteNames = [
        ...new Set(leaves.map((l) => l.site_name).filter(Boolean)),
      ];
      let usersByName = {};
      let headsBySite = {};

      if (userNames.length) {
        const { data: users } = await supabase
          .from("user_details")
          .select("username, role, site_name")
          .in("username", userNames);
        usersByName = (users || []).reduce(
          (map, item) => ({ ...map, [item.username]: item }),
          {},
        );
        siteNames = [
          ...new Set([
            ...siteNames,
            ...(users || []).map((u) => u.site_name).filter(Boolean),
          ]),
        ];
      }
      if (siteNames.length) {
        const { data: heads } = await supabase
          .from("site_details")
          .select("site_name, user_name, role")
          .in("site_name", siteNames)
          .eq("role", "Project Head");
        headsBySite = (heads || []).reduce(
          (map, item) => ({
            ...map,
            [item.site_name]: [...(map[item.site_name] || []), item.user_name],
          }),
          {},
        );
      }

      setAllLeaves(
        leaves.map((leave) => ({
          ...leave,
          role: leave.role || usersByName[leave.user_name]?.role || "",
          site_name:
            leave.site_name || usersByName[leave.user_name]?.site_name || "",
          head_user_names:
            headsBySite[
              leave.site_name || usersByName[leave.user_name]?.site_name
            ]?.join(", ") || "",
        })),
      );
    }
    setLoadingLeaves(false);
  }, []);
  const headEmployees = employees.filter(
    (e) => normalizeText(e.role) === "project head",
  );
  const inchargeEmployees = employees.filter(
    (e) => normalizeText(e.role) === "site incharge",
  );
  const pcEmployees = employees.filter(
    (e) => normalizeText(e.role) === "process controller",
  );
  const fetchSites = useCallback(async () => {
    setLoadingSites(true);
    const { data } = await supabase
      .from("site_details")
      .select("*")
      .order("created_at", { ascending: false });
    setSites(data || []);
    setLoadingSites(false);
  }, []);

  const handleSiteFormChange = (e) => {
    const { name, value } = e.target;
    setSiteForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "user_name") {
        const match = employees.find((emp) => emp.username === value);
        if (match?.role) next.role = match.role;
      }
      return next;
    });
  };

  const handleSiteSubmit = async () => {
    if (!siteForm.site_name.trim())
      return showToast("error", "Site name is required.");

    setSiteSubmitting(true);

    let site_image_url = siteForm.site_image_url || null;
    if (siteForm._imageFile) {
      try {
        setUploadingSiteImage(true);
        site_image_url = await uploadSiteImage(
          supabase,
          siteForm.site_name,
          siteForm._imageFile,
        );
      } catch (err) {
        setUploadingSiteImage(false);
        setSiteSubmitting(false);
        return showToast("error", err.message);
      }
      setUploadingSiteImage(false);
    }

    const payload = {
      site_name: siteForm.site_name.trim(),
      user_name: siteForm.user_name || null,
      role: siteForm.role.trim() || null,
      job_no: siteForm.job_no.trim() || null,
      started_date: siteForm.started_date || null,
      client_name: siteForm.client_name.trim() || null,
      head_name: siteForm.head_name.trim() || null,
      site_image_url,
      incharge_name: siteForm.incharge_name.trim() || null,
      head_contact_no: siteForm.head_contact_no.trim() || null,
      incharge_contact_no: siteForm.incharge_contact_no.trim() || null,
      pc_name: siteForm.pc_name.trim() || null,
      pc_contact_no: siteForm.pc_contact_no.trim() || null,
      status: toTitleCase(siteForm.status) || "Active",
    };

    if (editingSite) {
      const { error } = await supabase
        .from("site_details")
        .update(payload)
        .eq("id", editingSite.id);
      setSiteSubmitting(false);
      if (error)
        return showToast("error", "Failed to update site. " + error.message);
      showToast("success", "Site updated successfully!");
    } else {
      const { error } = await supabase.from("site_details").insert([payload]);
      setSiteSubmitting(false);
      if (error)
        return showToast("error", "Failed to add site. " + error.message);
      showToast("success", "Site added successfully!");
    }

    setSiteForm({ ...EMPTY_SITE_FORM });
    setEditingSite(null);
    fetchSites();
    setActiveTab("manage-sites");
  };

  const handleSiteEdit = (site) => {
    setEditingSite(site);
    setSiteForm({
      _imageFile: null,
      site_name: site.site_name || "",
      user_name: site.user_name || "",
      role: site.role || "",
      job_no: site.job_no || "",
      started_date: site.started_date || "",
      client_name: site.client_name || "",
      head_name: site.head_name || "",
      site_image_url: site.site_image_url || "",
      incharge_name: site.incharge_name || "",
      head_contact_no: site.head_contact_no || "",
      incharge_contact_no: site.incharge_contact_no || "",
      pc_name: site.pc_name || "",
      pc_contact_no: site.pc_contact_no || "",
      status: site.status || "Active",
    });
    setActiveTab("add-site");
  };

  const handleSiteDelete = async (id) => {
    if (!window.confirm("Delete this site?")) return;
    await supabase.from("site_details").delete().eq("id", id);
    setSites((p) => p.filter((s) => s.id !== id));
    showToast("success", "Site deleted.");
  };
  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    const { data } = await supabase
      .from("user_details") // ← must be "users" not "user_details"
      .select("*")
      .order("name", { ascending: true });
    setEmployees(data || []);
    setLoadingEmployees(false);
  }, []);

  const handleEmpFormChange = (e) => {
    const { name, value } = e.target;
    setEmpForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmpSubmit = async () => {
    if (
      !empForm.name.trim() ||
      !empForm.username.trim() ||
      !empForm.password.trim() ||
      !empForm.role.trim() ||
      !empForm.department.trim()
    )
      return showToast("error", "Please fill all required fields.");
    setEmpSubmitting(true);

    if (editingEmployee) {
      const { error } = await supabase
        .from("user_details")
        .update({
          name: empForm.name.trim(),
          username: empForm.username.trim(),
          password: empForm.password.trim(),
          role: empForm.role.trim(),
          department: toTitleCase(empForm.department),
          site_name: empForm.site_names[0] || empForm.site_name.trim() || null,
          site_names: empForm.site_names.length ? empForm.site_names : null,
          status: toTitleCase(empForm.status) || "Active",
        })
        .eq("id", editingEmployee.id);
      setEmpSubmitting(false);
      if (error)
        return showToast("error", "Failed to update. " + error.message);
      showToast("success", "Employee updated successfully!");
    } else {
      const { error } = await supabase.from("user_details").insert([
        {
          name: empForm.name.trim(),
          username: empForm.username.trim(),
          password: empForm.password.trim(),
          role: empForm.role.trim(),
          department: toTitleCase(empForm.department),
          site_name: empForm.site_names[0] || empForm.site_name.trim() || null,
          site_names: empForm.site_names.length ? empForm.site_names : null,
          status: toTitleCase(empForm.status) || "Active",
        },
      ]);
      setEmpSubmitting(false);
      if (error) return showToast("error", "Failed to save. " + error.message);
      showToast("success", "Employee added successfully!");
    }

    setEmpForm({
      name: "",
      username: "",
      password: "",
      role: "",
      department: "",
      site_name: "",
      status: "Active",
    });
    setEditingEmployee(null);
    fetchEmployees();
    setActiveTab("manage-employees");
  };

  const handleEmpEdit = (emp) => {
    setEditingEmployee(emp);
    setEmpForm({
      name: emp.name || "",
      username: emp.username || "",
      password: emp.password || "",
      role: emp.role || "",
      department: emp.department || "",
      site_name: emp.site_name || "",
      site_names: emp.site_names || (emp.site_name ? [emp.site_name] : []),
      status: emp.status || "Active",
    });
    setActiveTab("add-employee");
  };

  const handleEmpDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await supabase.from("user").delete().eq("id", id);
    setEmployees((p) => p.filter((e) => e.id !== id));
    showToast("success", "Employee deleted.");
  };

  useEffect(() => {
  if (user) {
    fetchAllTasks();
    fetchAllLeaves();
    fetchEmployees();
    fetchAllReschedules();
    fetchSites();
    fetchMySvrReports(user); // add this
  }
}, [
  user,
  fetchAllTasks,
  fetchAllLeaves,
  fetchEmployees,
  fetchAllReschedules,
  fetchSites,
  fetchMySvrReports, // add this
]);

  useRecurringTasks(user, fetchAllTasks);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleNavClick = (key) => {
    setActiveTab(key);
    if (key === "add-employee") {
      setEditingEmployee(null);
      setEmpForm({
        name: "",
        username: "",
        password: "",
        role: "",
        department: "",
        site_name: "",
        site_names: [],
        status: "active",
      });
    }
    if (key === "add-site") {
      setEditingSite(null);
      setSiteForm({ ...EMPTY_SITE_FORM });
    }
    if (typeof window !== "undefined" && window.innerWidth <= 760)
      setSidebarOpen(false);
  };
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "is_recurring" && !checked ? { recurrence: "" } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return showToast("error", "Title is required.");
    if (!form.assigned_to.trim())
      return showToast("error", "Assigned To is required.");
    if (form.is_recurring && !form.recurrence)
      return showToast("error", "Please select a recurrence pattern.");

    const anchor = form.is_recurring ? buildAnchor(form) : null;
    setSubmitting(true);

    // Upload audio if provided
    let audio_url = null;
    if (form._audioFile) {
      const ext = form._audioFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("task-audio")
        .upload(path, form._audioFile);
      if (upErr) {
        setSubmitting(false);
        return showToast("error", "Audio upload failed: " + upErr.message);
      }
      const { data: urlData } = supabase.storage
        .from("task-audio")
        .getPublicUrl(path);
      audio_url = urlData.publicUrl;
    }

    // Upload document if provided
    let document_url = null;
    if (form._docFile) {
      const ext = form._docFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("task-documents")
        .upload(path, form._docFile);
      if (upErr) {
        setSubmitting(false);
        return showToast("error", "Document upload failed: " + upErr.message);
      }
      const { data: urlData } = supabase.storage
        .from("task-documents")
        .getPublicUrl(path);
      document_url = urlData.publicUrl;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      assigned_to: form.assigned_to.trim(),
      site_name: form.site_name.trim() || null,
      assigned_by: user.user_name,
      priority: form.priority,
      status: form.status,
      due_date: form.due_date || null,
      is_recurring: form.is_recurring,
      recurrence: form.is_recurring ? form.recurrence : null,
      recurrence_anchor: anchor,
      last_generated_date: null,
      parent_task_id: null,
      reschedule_allowed: form.reschedule_allowed || false,
      audio_url,
      document_url,
    };

    const { data: insertedTask, error } = await supabase
      .from("tasks")
      .insert([payload])
      .select("id")
      .single();
    setSubmitting(false);

    if (error) {
      showToast("error", "Failed to assign task. " + error.message);
      return false;
    }

    if (form.enable_checkpoints) {
      await supabase
        .from("tasks")
        .update({ has_checkpoints: true })
        .eq("id", insertedTask.id);
    }

    const desc = form.is_recurring
      ? anchorDescription(form.recurrence, anchor)
      : null;
    showToast(
      "success",
      `Task "${form.title}" assigned${desc ? ` — repeats ${desc}` : ""}!`,
    );
    setForm({ ...EMPTY_FORM });
    fetchAllTasks();
    return true;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    setAllTasks((p) => p.filter((t) => t.id !== id));
    showToast("success", "Task deleted.");
  };

  const handleRescheduleAction = async (req, approved) => {
    if (!approved) {
      // Open the reject modal instead of window.prompt
      setRejectModal({ req, reason: "" });
      return;
    }
    // Approve path — unchanged
    setUpdatingRescheduleId(req.id);
    const payload = {
      status: "approved",
      actioned_by: user.user_name,
      actioned_at: new Date().toISOString(),
      admin_note: null,
    };
    const { error } = await supabase
      .from("reschedule_requests")
      .update(payload)
      .eq("id", req.id);
    if (!error) {
      await supabase
        .from("tasks")
        .update({ due_date: req.requested_date })
        .eq("id", req.task_id);
      fetchAllTasks();
    }
    setUpdatingRescheduleId(null);
    if (error) {
      showToast("error", "Failed to update: " + error.message);
      return;
    }
    setAllReschedules((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, ...payload } : r)),
    );
    showToast("success", "Reschedule approved — task due date updated.");
  };

  // Add this new function for confirming the rejection:
  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) return; // button is disabled, but guard anyway
    const req = rejectModal.req;
    const reason = rejectModal.reason.trim();
    setRejectModal(null);
    setUpdatingRescheduleId(req.id);
    const payload = {
      status: "rejected",
      actioned_by: user.user_name,
      actioned_at: new Date().toISOString(),
      admin_note: reason,
    };
    const { error } = await supabase
      .from("reschedule_requests")
      .update(payload)
      .eq("id", req.id);
    setUpdatingRescheduleId(null);
    if (error) {
      showToast("error", "Failed to reject: " + error.message);
      return;
    }
    setAllReschedules((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, ...payload } : r)),
    );
    showToast("success", "Reschedule rejected.");
  };

  const handleLeaveAction = async (leave, approved) => {
    setUpdatingLeaveId(leave.id);
    const payload = {
      admin_approved: approved,
      approved_by: approved ? user.user_name : null,
      rejection_reason: null,
      status: approved ? "Approved" : "Rejected",
    };
    const { error } = await supabase
      .from("leaves")
      .update(payload)
      .eq("id", leave.id);
    setUpdatingLeaveId(null);
    if (error) {
      showToast("error", "Failed to update leave. " + error.message);
      return;
    }
    setAllLeaves((prev) =>
      prev.map((item) =>
        item.id === leave.id ? { ...item, ...payload } : item,
      ),
    );
    showToast("success", approved ? "Leave approved." : "Leave rejected.");
  };

  if (!user)
    return (
      <h2 style={{ textAlign: "center", marginTop: 80, color: "#94a3b8" }}>
        Loading…
      </h2>
    );

  const activeItem = [...NAV_ITEMS, ...REPORTS_NAV, ...VERIFICATION_NAV, ...TICKETS_NAV].find((n) => n.key === activeTab);

  const pending = allTasks.filter((t) => t.status === "pending").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const completed = allTasks.filter((t) => t.status === "completed").length;
  const leaveTotal = allLeaves.length;
  const leavePending = allLeaves.filter(
    (l) => computeLeaveStatus(l) === "pending",
  ).length;
  const leavePendingForAdmin = allLeaves.filter(
    (l) => computeLeaveStatus(l) === "pending" && !isSiteEngineerLeave(l),
  ).length;
  const leaveApproved = allLeaves.filter(
    (l) => computeLeaveStatus(l) === "approved",
  ).length;
  const leaveRejected = allLeaves.filter(
    (l) => computeLeaveStatus(l) === "rejected",
  ).length;
  const reschedPending = allReschedules.filter(
    (r) => r.status === "pending",
  ).length;
  const recentLeaves = allLeaves.slice(0, 4);

  // Filtered tasks for the all-tasks tab
  const baseAllTasks = showRecurringInAllTasks
    ? allTasks
    : allTasks.filter((t) => !t.is_recurring && !t.parent_task_id);
  const filteredTasks = applyTaskFilters(baseAllTasks, taskFilters);
  const hasActiveFilters = Object.values(taskFilters).some((v) => v !== "");
  // Replace the 4 lines that compute tfSites/tfPriorities/tfStatuses/tfAssignees:

  // Each filter sees data filtered by everything EXCEPT itself
  const tasksForSites = applyTaskFilters(baseAllTasks, {
    ...taskFilters,
    site: "",
  });
  const tasksForPriorities = applyTaskFilters(baseAllTasks, {
    ...taskFilters,
    priority: "",
  });
  const tasksForStatuses = applyTaskFilters(baseAllTasks, {
    ...taskFilters,
    status: "",
  });
  const tasksForAssignees = applyTaskFilters(baseAllTasks, {
    ...taskFilters,
    assignedTo: "",
  });

  const tfSites = [
    ...new Set(tasksForSites.map((t) => t.site_name).filter(Boolean)),
  ].sort();
  const tfPriorities = [
    ...new Set(tasksForPriorities.map((t) => t.priority).filter(Boolean)),
  ].sort();
  const tfStatuses = [
    ...new Set(tasksForStatuses.map((t) => t.status).filter(Boolean)),
  ].sort();
  const tfAssignees = [
    ...new Set(tasksForAssignees.map((t) => t.assigned_to).filter(Boolean)),
  ].sort();

  const recurringTasks = allTasks.filter((t) => t.is_recurring);

  const filteredRecurring = recurringTasks.filter((t) => {
    if (recurringFilters.site && t.site_name !== recurringFilters.site)
      return false;
    if (
      recurringFilters.assignedTo &&
      t.assigned_to !== recurringFilters.assignedTo
    )
      return false;
    if (
      recurringFilters.recurrence &&
      t.recurrence !== recurringFilters.recurrence
    )
      return false;
    if (recurringFilters.dueSoon) {
      const next = getNextDueDate(t);
      if (!next) return false;
      const diff = Math.round(
        (next - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
      );
      if (diff > 7) return false;
    }
    return true;
  });

  const rfSites = [
    ...new Set(recurringTasks.map((t) => t.site_name).filter(Boolean)),
  ].sort();
  const rfAssignees = [
    ...new Set(recurringTasks.map((t) => t.assigned_to).filter(Boolean)),
  ].sort();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="ap-stats-row">
              <StatCard
                label="Total Tasks"
                value={total}
                accent="#2563eb"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                }
              />
              <StatCard
                label="Pending"
                value={pending}
                accent="#f59e0b"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                }
              />
              <StatCard
                label="In Progress"
                value={inProgress}
                accent="#6366f1"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                }
              />
              <StatCard
                label="Completed"
                value={completed}
                accent="#16a34a"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                }
              />
              <StatCard
                label="Pending Admin Leaves"
                value={leavePendingForAdmin}
                accent="#dc2626"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
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
                        <strong>
                          {leave.name || leave.user_name || "Employee"}
                        </strong>
                        <span>
                          {leave.leave_type} -{" "}
                          {formatLeaveDate(leave.from_date)} to{" "}
                          {formatLeaveDate(leave.to_date)}
                        </span>
                      </div>
                      <LeaveStatusBadge leave={leave} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="ap-dash-hint">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Recurring tasks auto-generate new instances on their scheduled
              day. If the previous instance is incomplete, the new one includes
              a warning note.
            </div>
          </>
        );
      case "assign-task":
        return (
          <TaskFormWithCheckpoints
            form={form}
            handleFormChange={handleFormChange}
            setForm={setForm}
            handleSubmit={handleSubmit}
            submitting={submitting}
            onSuccess={() => setShowTaskModal(false)}
            employees={assignableEmployees}
            sites={sites}
          />
        );

      case "all-tasks":
        return loadingTasks ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading tasks…</p>
          </div>
        ) : (
          <>
            {hasActiveFilters && (
              <p className="tf-count">
                Showing {filteredTasks.length} of {baseAllTasks.length} task
                {baseAllTasks.length !== 1 ? "s" : ""}
              </p>
            )}
            {filteredTasks.length === 0 ? (
              <div className="op-empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.3 }}
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="13" y2="13" />
                </svg>
                <p className="op-empty-text">
                  {hasActiveFilters
                    ? "No tasks match the current filters."
                    : "No tasks found. Start by assigning one."}
                </p>
                {hasActiveFilters && (
                  <button
                    className="tf-clear"
                    style={{ marginTop: 4 }}
                    onClick={() => setTaskFilters({ ...EMPTY_TASK_FILTERS })}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        {[
                          "Title",
                          "Assigned To",
                          "Site",
                          "Given By",
                          "Priority",
                          "Status",
                          "Due Date",
                          "Schedule",
                          "",
                        ].map((h) => (
                          <th key={h} className="ap-th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((t) => (
                        <TaskRow
                          key={t.id}
                          task={t}
                          onDelete={handleDelete}
                          userMap={userMap}
                          onClick={setDetailTask}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="ap-task-mobile-grid">
                  {filteredTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onDelete={handleDelete}
                      onOpenDetail={setDetailTask}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        );

      case "recurring-tasks":
        return (
          <>
            {/* Header row: count + filter icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
                gap: 10,
              }}
            >
              <p className="tf-count" style={{ margin: 0 }}>
                {filteredRecurring.length} of {recurringTasks.length} recurring
                task{recurringTasks.length !== 1 ? "s" : ""}
              </p>

              {/* Filter icon button (always visible, especially useful on mobile) */}
              <div style={{ position: "relative" }}>
                <button
                  className={`tf-mobile-btn recurring-mobile-filter-btn${recurringMobileFilterOpen ? " Active" : ""}`}
                  onClick={() => setRecurringMobileFilterOpen((p) => !p)}
                  title="Filter"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  {Object.values(recurringFilters).some(
                    (v) => v !== "" && v !== false,
                  ) && <span className="tf-mobile-badge" />}
                </button>

                {/* Dropdown filter panel */}
                {recurringMobileFilterOpen && (
                  <div className="tf-popup" style={{ width: 280 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div className="tf-group" style={{ width: "100%" }}>
                        <span className="tf-label">
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Assignee
                        </span>
                        <select
                          className="tf-select"
                          style={{ flex: 1 }}
                          value={recurringFilters.assignedTo}
                          onChange={(e) =>
                            setRecurringFilters((p) => ({
                              ...p,
                              assignedTo: e.target.value,
                            }))
                          }
                        >
                          <option value="">All users</option>
                          {rfAssignees.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>

                      {rfSites.length > 0 && (
                        <div className="tf-group" style={{ width: "100%" }}>
                          <span className="tf-label">Site</span>
                          <select
                            className="tf-select"
                            style={{ flex: 1 }}
                            value={recurringFilters.site}
                            onChange={(e) =>
                              setRecurringFilters((p) => ({
                                ...p,
                                site: e.target.value,
                              }))
                            }
                          >
                            <option value="">All sites</option>
                            {rfSites.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="tf-group" style={{ width: "100%" }}>
                        <span className="tf-label">Pattern</span>
                        <select
                          className="tf-select"
                          style={{ flex: 1 }}
                          value={recurringFilters.recurrence}
                          onChange={(e) =>
                            setRecurringFilters((p) => ({
                              ...p,
                              recurrence: e.target.value,
                            }))
                          }
                        >
                          <option value="">All patterns</option>
                          {["daily", "weekly", "monthly", "yearly"].map((r) => (
                            <option key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: recurringFilters.dueSoon
                            ? "#dc2626"
                            : "#64748b",
                          background: recurringFilters.dueSoon
                            ? "#fef2f2"
                            : "#f8fafc",
                          border: `1px solid ${recurringFilters.dueSoon ? "#fecaca" : "#e2e8f0"}`,
                          borderRadius: 8,
                          padding: "8px 12px",
                          transition: "all .15s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={recurringFilters.dueSoon}
                          onChange={(e) =>
                            setRecurringFilters((p) => ({
                              ...p,
                              dueSoon: e.target.checked,
                            }))
                          }
                          style={{
                            accentColor: "#dc2626",
                            width: 14,
                            height: 14,
                          }}
                        />
                        Due within 7 days
                      </label>

                      {Object.values(recurringFilters).some(
                        (v) => v !== "" && v !== false,
                      ) && (
                        <button
                          className="tf-clear"
                          style={{
                            width: "100%",
                            justifyContent: "center",
                            marginLeft: 0,
                          }}
                          onClick={() => {
                            setRecurringFilters({ ...EMPTY_RECURRING_FILTERS });
                            setRecurringMobileFilterOpen(false);
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop filter bar — hidden on mobile via CSS */}
            <div
              className="tf-bar recurring-desktop-bar"
              style={{
                marginBottom: 16,
                position: "fixed",
                top: "120px",
                right: "80px",
              }}
            >
              <div className="tf-group">
                <span className="tf-label">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <select
                  className="tf-select"
                  value={recurringFilters.assignedTo}
                  onChange={(e) =>
                    setRecurringFilters((p) => ({
                      ...p,
                      assignedTo: e.target.value,
                    }))
                  }
                >
                  <option value="">All users</option>
                  {rfAssignees.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tf-divider" />
              {rfSites.length > 0 && (
                <>
                  <div className="tf-group">
                    <select
                      className="tf-select"
                      value={recurringFilters.site}
                      onChange={(e) =>
                        setRecurringFilters((p) => ({
                          ...p,
                          site: e.target.value,
                        }))
                      }
                    >
                      <option value="">All sites</option>
                      {rfSites.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="tf-divider" />
                </>
              )}
              <div className="tf-group">
                <select
                  className="tf-select"
                  value={recurringFilters.recurrence}
                  onChange={(e) =>
                    setRecurringFilters((p) => ({
                      ...p,
                      recurrence: e.target.value,
                    }))
                  }
                >
                  <option value="">All patterns</option>
                  {["daily", "weekly", "monthly", "yearly"].map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tf-divider" />
              <div className="tf-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: recurringFilters.dueSoon ? "#dc2626" : "#64748b",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={recurringFilters.dueSoon}
                    onChange={(e) =>
                      setRecurringFilters((p) => ({
                        ...p,
                        dueSoon: e.target.checked,
                      }))
                    }
                    style={{ accentColor: "#dc2626" }}
                  />
                  Due within 7 days
                </label>
              </div>
              {Object.values(recurringFilters).some(
                (v) => v !== "" && v !== false,
              ) && (
                <button
                  className="tf-clear"
                  onClick={() =>
                    setRecurringFilters({ ...EMPTY_RECURRING_FILTERS })
                  }
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            {filteredRecurring.length === 0 ? (
              <div className="op-empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.3 }}
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <p className="op-empty-text">
                  {recurringTasks.length === 0
                    ? "No recurring tasks yet. Create one from Assign Task."
                    : "No tasks match the current filters."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        {[
                          "Title",
                          "Assigned To",
                          "Site",
                          "Priority",
                          "Pattern",
                          "Next Due",
                          "",
                        ].map((h) => (
                          <th key={h} className="ap-th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecurring.map((task) => {
                        const nextDate = getNextDueDate(task);
                        const next = formatNextDue(nextDate);
                        const p =
                          PRIORITY_STYLES[task.priority] ||
                          PRIORITY_STYLES.medium;
                        return (
                          <tr key={task.id} className="ap-tr">
                            <td className="ap-td ap-td-title">
                              {task.title}
                              <div
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  marginTop: 4,
                                  flexWrap: "wrap",
                                }}
                              >
                                {task.audio_url && (
                                  <a
                                    href={task.audio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: "#7c3aed",
                                      background: "#f5f3ff",
                                      border: "1px solid #ddd6fe",
                                      borderRadius: 5,
                                      padding: "2px 7px",
                                      textDecoration: "none",
                                    }}
                                  >
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                      <line x1="12" y1="19" x2="12" y2="23" />
                                      <line x1="8" y1="23" x2="16" y2="23" />
                                    </svg>
                                    Audio
                                  </a>
                                )}
                                {task.document_url && (
                                  <a
                                    href={task.document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: "#0369a1",
                                      background: "#f0f9ff",
                                      border: "1px solid #bae6fd",
                                      borderRadius: 5,
                                      padding: "2px 7px",
                                      textDecoration: "none",
                                    }}
                                  >
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    Doc
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="ap-td">{task.assigned_to}</td>
                            <td className="ap-td">{task.site_name || "—"}</td>
                            <td className="ap-td">
                              <span
                                className="ap-badge"
                                style={{ background: p.bg, color: p.color }}
                              >
                                <span
                                  className="ap-badge-dot"
                                  style={{ background: p.dot }}
                                />
                                {task.priority}
                              </span>
                            </td>
                            <td className="ap-td">
                              <span className="ap-pill-blue">
                                {anchorDescription(
                                  task.recurrence,
                                  task.recurrence_anchor,
                                ) || task.recurrence}
                              </span>
                            </td>
                            <td className="ap-td">
                              {next?.label ? (
                                <span
                                  style={{ fontSize: 13, color: "#334155" }}
                                >
                                  {next.label}
                                  {next.badge && (
                                    <span
                                      style={{
                                        marginLeft: 6,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        background: next.bg,
                                        color: next.color,
                                        borderRadius: 20,
                                        padding: "2px 7px",
                                      }}
                                    >
                                      {next.badge}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="ap-td">
                              <button
                                className="ap-del-btn"
                                onClick={() => handleDelete(task.id)}
                                title="Delete"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4h6v2" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="ap-task-mobile-grid">
                  <div className="ap-task-mobile-grid">
                    {filteredRecurring.map((task) => {
                      const nextDate = getNextDueDate(task);
                      const next = formatNextDue(nextDate);
                      const p =
                        PRIORITY_STYLES[task.priority] ||
                        PRIORITY_STYLES.medium;
                      return (
                        <RecurringTaskCard
                          key={task.id}
                          task={task}
                          next={next}
                          p={p}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        );
      case "leave-requests":
        return loadingLeaves ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading leaves...</p>
          </div>
        ) : allLeaves.length === 0 ? (
          <div className="op-empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="op-empty-text">No leave requests found.</p>
          </div>
        ) : (
          <>
            <div className="ap-leave-summary ap-leave-summary-tight">
              <div>
                <span>Total</span>
                <strong>{leaveTotal}</strong>
              </div>
              <div>
                <span>Pending</span>
                <strong>{leavePending}</strong>
              </div>
              <div>
                <span>Admin Action</span>
                <strong>{leavePendingForAdmin}</strong>
              </div>
              <div>
                <span>Approved</span>
                <strong>{leaveApproved}</strong>
              </div>
              <div>
                <span>Rejected</span>
                <strong>{leaveRejected}</strong>
              </div>
            </div>
            <div className="ap-leave-grid">
              {allLeaves.map((leave) => (
                <LeaveRequestCard
                  key={leave.id}
                  leave={leave}
                  onAction={handleLeaveAction}
                  updating={updatingLeaveId}
                  roleByName={roleByName}
                />
              ))}
            </div>
          </>
        );

      case "add-employee":
        return (
          <div className="ap-form-grid">
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Full Name <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  name="name"
                  value={empForm.name}
                  onChange={handleEmpFormChange}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">
                  Username <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  name="username"
                  autoComplete="off"
                  value={empForm.username}
                  onChange={handleEmpFormChange}
                  placeholder="e.g. john.doe"
                  disabled={!!editingEmployee}
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Password <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={empForm.password}
                  onChange={handleEmpFormChange}
                  placeholder="••••••••"
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">
                  Role <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  name="role"
                  value={empForm.role}
                  onChange={handleEmpFormChange}
                  placeholder="e.g. Site Engineer"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Department <span className="ap-req">*</span>
                </label>
                <select
                  className="ap-input ap-select"
                  name="department"
                  value={empForm.department}
                  onChange={handleEmpFormChange}
                >
                  <option value="">Select department…</option>
                  <option value="admin">Admin</option>
                  <option value="site engineer">Site Engineer</option>
                  <option value="project head">Project Head</option>
                  <option value="engineer office">Engineer Office</option>
                  <option value="mdo office">MDO Office</option>
                  <option value="hr">HR</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Site(s) Assigned</label>
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "8px 10px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    minHeight: 42,
                  }}
                >
                  {empForm.site_names.length === 0 && (
                    <span
                      style={{
                        fontSize: 12.5,
                        color: "#94a3b8",
                        padding: "3px 2px",
                      }}
                    >
                      No sites assigned yet
                    </span>
                  )}
                  {empForm.site_names.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        borderRadius: 6,
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: "2px 8px",
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() =>
                          setEmpForm((p) => ({
                            ...p,
                            site_names: p.site_names.filter((x) => x !== s),
                          }))
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#2563eb",
                          padding: 0,
                          lineHeight: 1,
                          fontSize: 13,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <select
                  className="ap-input ap-select"
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !empForm.site_names.includes(val)) {
                      setEmpForm((p) => ({
                        ...p,
                        site_names: [...p.site_names, val],
                      }));
                    }
                  }}
                >
                  <option value="">+ Add a site…</option>
                  {sites
                    .filter((s) => !empForm.site_names.includes(s.site_name))
                    .map((s) => (
                      <option key={s.id} value={s.site_name}>
                        {s.site_name}
                      </option>
                    ))}
                </select>

                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Select a site to add it. Click the × on a chip to remove.
                </span>
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Status</label>
                <select
                  className="ap-input ap-select"
                  name="status"
                  value={empForm.status}
                  onChange={handleEmpFormChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="ap-form-row ap-col-1 ap-form-actions">
              {editingEmployee ? (
                <button
                  className="ap-btn-secondary"
                  onClick={() => {
                    setEmpForm({
                      name: "",
                      username: "",
                      password: "",
                      role: "",
                      department: "",
                      site_name: "",
                      site_names: [],
                      status: "active",
                    });
                    setEditingEmployee(null);
                    setActiveTab("manage-employees");
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  className="ap-btn-secondary"
                  onClick={() => {
                    setEmpForm({
                      name: "",
                      username: "",
                      password: "",
                      role: "",
                      department: "",
                      site_name: "",
                      site_names: [],
                      status: "active",
                    });
                  }}
                >
                  Reset
                </button>
              )}
              <button
                className="ap-btn-primary"
                onClick={handleEmpSubmit}
                disabled={empSubmitting}
              >
                {empSubmitting ? (
                  <>
                    <span className="ap-mini-spinner" /> Saving…
                  </>
                ) : editingEmployee ? (
                  "Update Employee"
                ) : (
                  "Add Employee"
                )}
              </button>
            </div>
          </div>
        );

      case "manage-employees":
        return loadingEmployees ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading employees…</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="op-empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <p className="op-empty-text">No employees found.</p>
            <button
              className="ap-btn-primary"
              style={{ marginTop: 4 }}
              onClick={() => setActiveTab("add-employee")}
            >
              Add Employee
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Name",
                      "Username",
                      "Role",
                      "Department",
                      "Site",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="ap-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => (
                    <tr key={emp.id} className="ap-tr">
                      <td
                        className="ap-td"
                        style={{ color: "#94a3b8", fontSize: 12 }}
                      >
                        {idx + 1}
                      </td>
                      <td className="ap-td ap-td-title">{emp.name || "—"}</td>
                      <td
                        className="ap-td"
                        style={{
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 12.5,
                        }}
                      >
                        {emp.username || "—"}
                      </td>
                      <td className="ap-td">
                        {emp.role ? (
                          <span className="ap-pill-blue">
                            {(emp.role || "").toUpperCase()}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td className="ap-td">{emp.department || "—"}</td>
                      <td className="ap-td">
                        {(emp.site_names?.length > 0
                          ? emp.site_names
                          : emp.site_name
                            ? [emp.site_name]
                            : []
                        ).map((s) => (
                          <span
                            key={s}
                            className="ap-pill-blue"
                            style={{ marginRight: 4, marginBottom: 2 }}
                          >
                            {s.toUpperCase()}
                          </span>
                        ))}
                        {!emp.site_names?.length && !emp.site_name && (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td className="ap-td">
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background:
                              emp.status === "Active" ? "#f0fdf4" : "#fef2f2",
                            color:
                              emp.status === "Active" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {emp.status || "—"}
                        </span>
                      </td>
                      <td className="ap-td">
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="ap-edit-btn"
                            onClick={() => handleEmpEdit(emp)}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="ap-del-btn"
                            onClick={() => handleEmpDelete(emp.id)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="ap-task-mobile-grid">
              {employees.map((emp) => (
                <div key={emp.id} className="ap-task-card-mobile">
                  <div className="ap-task-card-head">
                    <div>
                      <div className="ap-task-card-title">{emp.name}</div>
                      <div
                        className="ap-task-card-sub"
                        style={{ fontFamily: "'DM Mono',monospace" }}
                      >
                        {emp.user_name}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="ap-edit-btn"
                        onClick={() => handleEmpEdit(emp)}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="ap-del-btn"
                        onClick={() => handleEmpDelete(emp.id)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="ap-task-card-meta">
                    <div>
                      <span>Department</span>
                      <strong>{emp.department || "—"}</strong>
                    </div>
                    <div>
                      <span>Designation</span>
                      <strong>{emp.designation || "—"}</strong>
                    </div>
                    <div>
                      <span>Sites</span>
                      <strong>
                        {(emp.site_names?.length
                          ? emp.site_names
                          : emp.site_name
                            ? [emp.site_name]
                            : []
                        ).join(", ") || "—"}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case "add-site":
        return (
          <div className="ap-form-grid">
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Site Name <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  name="site_name"
                  value={siteForm.site_name}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. Bhagyashree Warehouse"
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">Assigned User</label>
                <select
                  className="ap-input ap-select"
                  name="user_name"
                  value={siteForm.user_name}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select employee…</option>
                  {employees.map((e) => (
                    <option key={e.username} value={e.username}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Role</label>
                <select
                  className="ap-input ap-select"
                  name="role"
                  value={siteForm.role}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select role…</option>
                  <option value="admin">Admin</option>
                  <option value="site engineer">Site Engineer</option>
                  <option value="project head">Project Head</option>
                  <option value="engineer office">Engineer Office</option>
                  <option value="mdo office">MDO Office</option>
                  <option value="hr">HR</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">
                  Job No.
                  <span
                    className="ap-optional"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#94a3b8",
                      background: "#f1f5f9",
                      borderRadius: 4,
                      padding: "1px 6px",
                      marginLeft: 6,
                    }}
                  >
                    auto-generated
                  </span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="ap-input"
                    name="job_no"
                    value={siteForm.job_no}
                    onChange={handleSiteFormChange}
                    placeholder="e.g. DIP-001|2026|SiteName"
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 12.5,
                    }}
                  />
                  <button
                    type="button"
                    className="ap-btn-secondary"
                    style={{ flexShrink: 0, padding: "0 14px" }}
                    onClick={regenerateJobNo}
                    disabled={!siteForm.site_name.trim()}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Started Date</label>
                <input
                  className="ap-input"
                  type="date"
                  name="started_date"
                  value={siteForm.started_date}
                  onChange={handleSiteFormChange}
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">Client Name</label>
                <input
                  className="ap-input"
                  name="client_name"
                  value={siteForm.client_name}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Head Name</label>
                <select
                  className="ap-input ap-select"
                  name="head_name"
                  value={siteForm.head_name}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select…</option>
                  {headEmployees.map((e) => (
                    <option key={e.username} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Head Contact No.</label>
                <input
                  className="ap-input"
                  name="head_contact_no"
                  value={siteForm.head_contact_no}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Incharge Name</label>
                <select
                  className="ap-input ap-select"
                  name="incharge_name"
                  value={siteForm.incharge_name}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select…</option>
                  {inchargeEmployees.map((e) => (
                    <option key={e.username} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Incharge Contact No.</label>
                <input
                  className="ap-input"
                  name="incharge_contact_no"
                  value={siteForm.incharge_contact_no}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">PC Name</label>
                <select
                  className="ap-input ap-select"
                  name="pc_name"
                  value={siteForm.pc_name}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select…</option>
                  {pcEmployees.map((e) => (
                    <option key={e.username} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">PC Contact No.</label>
                <input
                  className="ap-input"
                  name="pc_contact_no"
                  value={siteForm.pc_contact_no}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Site Image
                  <span
                    className="ap-optional"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#94a3b8",
                      background: "#f1f5f9",
                      borderRadius: 4,
                      padding: "1px 6px",
                      marginLeft: 6,
                    }}
                  >
                    optional
                  </span>
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    style={{
                      flex: 1,
                      fontSize: 12.5,
                      color: "#475569",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                    }}
                    onChange={(e) =>
                      setSiteForm((p) => ({
                        ...p,
                        _imageFile: e.target.files[0] || null,
                      }))
                    }
                  />
                </div>
                {siteForm._imageFile && (
                  <span style={{ fontSize: 11.5, color: "#16a34a" }}>
                    ✓ {siteForm._imageFile.name}
                  </span>
                )}
                {!siteForm._imageFile && siteForm.site_image_url && (
                  <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                    Current: {siteForm.site_image_url}
                  </span>
                )}
                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Uploads to a bucket named after the site, inside SiteImg/.
                </span>
              </div>
              <div className="ap-field">
                <label className="ap-label">Status</label>
                <select
                  className="ap-input ap-select"
                  name="status"
                  value={siteForm.status}
                  onChange={handleSiteFormChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="ap-form-row ap-col-1 ap-form-actions">
              {editingSite ? (
                <button
                  className="ap-btn-secondary"
                  onClick={() => {
                    setSiteForm({ ...EMPTY_SITE_FORM });
                    setEditingSite(null);
                    setActiveTab("manage-sites");
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  className="ap-btn-secondary"
                  onClick={() => setSiteForm({ ...EMPTY_SITE_FORM })}
                >
                  Reset
                </button>
              )}
              <button
                className="ap-btn-primary"
                onClick={handleSiteSubmit}
                disabled={siteSubmitting}
              >
                {siteSubmitting ? (
                  <>
                    <span className="ap-mini-spinner" />{" "}
                    {uploadingSiteImage ? "Uploading image…" : "Saving…"}
                  </>
                ) : editingSite ? (
                  "Update Site"
                ) : (
                  "Add Site"
                )}
              </button>
            </div>
          </div>
        );

      case "manage-sites":
        return loadingSites ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading sites…</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="op-empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <p className="op-empty-text">No sites found.</p>
            <button
              className="ap-btn-primary"
              style={{ marginTop: 4 }}
              onClick={() => setActiveTab("add-site")}
            >
              Add Site
            </button>
          </div>
        ) : (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Site Name",
                      "Assigned User",
                      "Role",
                      "Job No.",
                      "Started",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="ap-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site, idx) => (
                    <tr key={site.id} className="ap-tr">
                      <td
                        className="ap-td"
                        style={{ color: "#94a3b8", fontSize: 12 }}
                      >
                        {idx + 1}
                      </td>
                      <td className="ap-td ap-td-title">
                        {site.site_name || "—"}
                      </td>
                      <td className="ap-td">
                        {nameFor(userMap, site.user_name)}
                      </td>
                      <td className="ap-td">
                        {site.role ? (
                          <span className="ap-pill-blue">{site.role}</span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td
                        className="ap-td"
                        style={{
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 12,
                        }}
                      >
                        {site.job_no || "—"}
                      </td>
                      <td className="ap-td">
                        {site.started_date
                          ? new Date(
                              site.started_date + "T00:00:00",
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="ap-td">
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background:
                              site.status === "Active" ? "#f0fdf4" : "#fef2f2",
                            color:
                              site.status === "Active" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {site.status || "—"}
                        </span>
                      </td>
                      <td className="ap-td">
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="ap-edit-btn"
                            onClick={() => handleSiteEdit(site)}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="ap-del-btn"
                            onClick={() => handleSiteDelete(site.id)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ap-task-mobile-grid">
              {sites.map((site) => (
                <div key={site.id} className="ap-task-card-mobile">
                  <div className="ap-task-card-head">
                    <div>
                      <div className="ap-task-card-title">{site.site_name}</div>
                      <div className="ap-task-card-sub">
                        {nameFor(userMap, site.user_name)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="ap-edit-btn"
                        onClick={() => handleSiteEdit(site)}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="ap-del-btn"
                        onClick={() => handleSiteDelete(site.id)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="ap-task-card-meta">
                    <div>
                      <span>Role</span>
                      <strong>{site.role || "—"}</strong>
                    </div>
                    <div>
                      <span>Job No.</span>
                      <strong>{site.job_no || "—"}</strong>
                    </div>
                    <div>
                      <span>Client</span>
                      <strong>{site.client_name || "—"}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{site.status || "—"}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case "reschedule-requests":
        return loadingReschedules ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading reschedule requests…</p>
          </div>
        ) : allReschedules.length === 0 ? (
          <div className="op-empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <p className="op-empty-text">No reschedule requests found.</p>
          </div>
        ) : (
          <>
            <div className="ap-leave-summary ap-leave-summary-tight">
              <div>
                <span>Total</span>
                <strong>{allReschedules.length}</strong>
              </div>
              <div>
                <span>Pending</span>
                <strong>{reschedPending}</strong>
              </div>
              <div>
                <span>Approved</span>
                <strong>
                  {allReschedules.filter((r) => r.status === "approved").length}
                </strong>
              </div>
              <div>
                <span>Rejected</span>
                <strong>
                  {allReschedules.filter((r) => r.status === "rejected").length}
                </strong>
              </div>
            </div>
            <div className="ap-leave-grid">
              {allReschedules.map((req) => (
                <RescheduleRequestCard
                  key={req.id}
                  req={req}
                  onAction={handleRescheduleAction}
                  updating={updatingRescheduleId}
                  roleByName={roleByName}
                />
              ))}
            </div>
          </>
        );
        case "site-report":
  return <SiteReport user={user} />;

case "svr-reports":
  if (loadingSvrReports)
    return (
      <div className="op-empty-state">
        <div className="op-spinner" />
        <p className="op-empty-text">Loading your reports…</p>
      </div>
    );
  if (!mySvrReports.length)
    return (
      <div className="op-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="op-empty-text">You haven't submitted any Site Visit Reports yet.</p>
      </div>
    );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
      {mySvrReports.map((r) => (
        <div
          key={r.id}
          style={{
            background: "#fff", border: "1px solid #e8edf3", borderLeft: "4px solid #16a34a",
            borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
              Site Visit
            </span>
            {r.site_name && <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{r.site_name}</span>}
          </div>
          <div style={{ fontSize: 12.5, color: "#64748b" }}>
            {r.visit_date
              ? new Date(r.visit_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "—"}
          </div>
          {r.progress_of_work && (
            <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {r.progress_of_work}
            </p>
          )}
          {r.pdf_url ? (
            <div style={{ display: "flex", gap: 8 }}>
              <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 12px", textDecoration: "none" }}>
                View
              </a>
            <a href={buildDownloadUrl(r.pdf_url, `${r.site_name || "site"}-SVR-${r.visit_date || r.id}.pdf`)}
                download
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 7, padding: "6px 12px", textDecoration: "none" }}
              >
                Download
              </a>
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>No PDF attached</span>
          )}
        </div>
      ))}
    </div>
  );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
            .op-root  { font-family: 'DM Sans', sans-serif; background: #f4f6f9; min-height: 100vh; color: #1e293b; }
            .op-body  { display: flex; min-height: calc(100vh - 60px); align-items: flex-start; background: #c9d0d4d0;}
            .op-sidebar { width: 270px; min-width: 240px; background: #fff; border-right: 1px solid #e8edf3; display: flex; flex-direction: column; transition: width .25s cubic-bezier(.4,0,.2,1), min-width .25s, opacity .2s; overflow: hidden; box-shadow: 2px 0 12px rgba(0,0,0,.04); position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; }
            .op-sidebar.collapsed { width: 0; min-width: 0; opacity: 0; pointer-events: none; }
            .op-sidebar-header { padding: 20px 20px 12px; border-bottom: 1px solid #f0f4f8; display: flex; align-items: center; justify-content: space-between; gap: 12px;}
            .op-sidebar { width: 270px; min-width: 240px; background: #fff; border-right: 1px solid #e8edf3; display: flex; flex-direction: column; transition: width .25s cubic-bezier(.4,0,.2,1), min-width .25s, opacity .2s; overflow: hidden; box-shadow: 2px 0 12px rgba(0,0,0,.04); position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
            .op-sidebar::-webkit-scrollbar { width: 5px; }
            .op-sidebar::-webkit-scrollbar-track { background: transparent; }
            .op-sidebar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .op-sidebar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

            .op-sidebar-close { display: none; width: 32px; height: 32px; border-radius: 8px; border: 1px solid #c9d0d4d0; background: #fff; color: #64748b; cursor: pointer; align-items: center; justify-content: center; }
            .op-sidebar-backdrop { display: none; }
            .op-nav { padding: 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
            .op-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: #64748b; font-size: 13.5px; font-weight: 500; white-space: nowrap; border: none; background: transparent; width: 100%; text-align: left; transition: background .15s, color .15s; position: relative; }
            .op-nav-item:hover  { background: #f1f5f9; color: #1e293b; }
            .op-nav-item.Active { background: #fef2f2; color: #dc2626; }
            .op-nav-item.Active svg { stroke: #dc2626; }
            .op-nav-icon { flex-shrink: 0; display: flex; align-items: center; }
            .op-nav-badge { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: #dc2626; color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 999px; display: flex; align-items: center; justify-content: center; padding: 0 5px; }

            .op-main { flex: 1; padding: 28px 32px; overflow: auto; }
            .op-topbar { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
            .op-toggle-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #c9d0d4d0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; transition: background .15s; flex-shrink: 0; }
            .op-toggle-btn:hover { background: #f1f5f9; }
            .op-page-title { font-size: 18px; font-weight: 600; color: #1e293b; }

            .op-profile-card { background: #fff; border-radius: 14px; padding: 24px 28px; border-bottom: 4px solid transparent;border-right: 4px solid transparent;background:linear-gradient(white, white) padding-box,linear-gradient(135deg,#3d1200 0%,#7a2e00 50%,#c96a10 100%) border-box; box-shadow: 0 4px 20px rgba(220,38,38,.08); margin-bottom: 28px; display: flex; align-items: center; gap: 20px; width:100% !important}
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

            /* ── Filter Bar ── */
           .tf-bar {width:50%;display: flex; flex-wrap: wrap; gap: 8px; align-items: center;padding: 10px 14px; background: #c9d0d4dc; border: 1px solid #e8edf3;border-radius: 10px; margin-bottom: 16px;}
            .tf-bar-fixed {position: fixed; top: 120px; right: 50px; z-index: 10; width: 50%;}
            .tf-group { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; }
            .tf-label { font-size: 12px; font-weight: 600; color: #64748b; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
            .tf-input { font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #1e293b; background: #fff; border: 1px solid #c9d0d4d0; border-radius: 6px; padding: 5px 9px; height: 32px; outline: none; transition: border .15s; }
            .tf-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,.08); }
            .tf-date { width: 140px; cursor: pointer; }
            .tf-select { font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #1e293b; background: #fff; border: 1px solid #c9d0d4d0; border-radius: 6px; padding: 5px 9px; height: 32px; cursor: pointer; outline: none; transition: border .15s; }
            .tf-select:focus { border-color: #dc2626; }
            .tf-sep-text { font-size: 12px; color: #94a3b8; }
            .tf-divider { width: 1px; height: 20px; background: #c9d0d4d0; flex-shrink: 0; }
            .tf-clear { display: inline-flex; align-items: center; gap: 5px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 5px 11px; height: 32px; cursor: pointer; white-space: nowrap; transition: background .15s; margin-left: auto; }
            .tf-clear:hover { background: #fee2e2; }
            .tf-count { font-size: 12px; color: #64748b; margin-bottom: 12px; margin-top: -6px; }

            /* Stats */
            .ap-stats-row { display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap: 16px; margin-bottom: 24px; }
            .ap-stat-card  { background: #fff; border: 1px solid #e8edf3; border-top: 4px solid; border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; }
            .ap-stat-icon  { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .ap-stat-value { font-size: 26px; font-weight: 700; color: #1e293b; font-family: 'DM Mono', monospace; line-height: 1; }
            .ap-stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
            .ap-dash-hint  { display: flex; align-items: flex-start; gap: 8px; background: #f8fafc; border: 1px solid #c9d0d4d0; border-radius: 10px; padding: 14px 16px; font-size: 13px; color: #64748b; line-height: 1.5; }
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
            .ap-input { font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1e293b; background: #f8fafc; border: 1px solid #c9d0d4d0; border-radius: 8px; padding: 9px 12px; outline: none; transition: border .15s, box-shadow .15s; width: 100%; }
            .ap-input:focus  { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,.1); background: #fff; }
            .ap-textarea { resize: vertical; min-height: 80px; }
            .ap-select   { cursor: pointer; }
            .ap-form-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
            .ap-btn-primary  { display: inline-flex; align-items: center; gap: 7px; background: #dc2626; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; transition: background .15s, transform .1s; }
            .ap-btn-primary:hover:not(:disabled)  { background: #b91c1c; }
            .ap-btn-primary:Active:not(:disabled) { transform: scale(.98); }
            .ap-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
            .ap-btn-secondary { display: inline-flex; align-items: center; gap: 7px; background: #f1f5f9; color: #475569; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; padding: 10px 18px; border-radius: 8px; border: 1px solid #c9d0d4d0; cursor: pointer; transition: background .15s; }
            .ap-btn-secondary:hover { background: #c9d0d4d0; }
            .ap-mini-spinner  { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }

            /* Toggle */
            .ap-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-top: 4px; }
            .ap-toggle input { display: none; }
            .ap-toggle-track { width: 40px; height: 22px; background: #c9d0d4d0; border-radius: 99px; position: relative; transition: background .2s; flex-shrink: 0; }
            .ap-toggle input:checked + .ap-toggle-track { background: #dc2626; }
            .ap-toggle-thumb { width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
            .ap-toggle input:checked + .ap-toggle-track .ap-toggle-thumb { transform: translateX(18px); }
            .ap-toggle-label { font-size: 13px; color: #475569; font-weight: 500; }

            /* Recurrence */
            .ap-recurrence-divider { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; padding: 4px 0 2px; border-top: 1px dashed #c9d0d4d0; padding-top: 8px; }
            .ap-recurrence-pills   { display: flex; gap: 8px; flex-wrap: wrap; }
            .ap-rpill { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: 1.5px solid #c9d0d4d0; background: #f8fafc; color: #64748b; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
            .ap-rpill:hover  { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
            .ap-rpill.Active { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
            .ap-weekday-grid { display: flex; gap: 6px; flex-wrap: wrap; }
            .ap-wday { width: 46px; height: 40px; border-radius: 8px; border: 1.5px solid #c9d0d4d0; background: #f8fafc; color: #64748b; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
            .ap-wday:hover  { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
            .ap-wday.Active { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
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
            .ap-del-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #c9d0d4d0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #94a3b8; transition: background .15s, color .15s, border-color .15s; }
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
            .ap-mobile-pill-muted { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; color: #64748b; background: #f8fafc; border: 1px solid #c9d0d4d0; border-radius: 6px; padding: 2px 8px; text-transform: capitalize; }

            /* Leave */
            .ap-leave-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 16px; }
            .ap-leave-card { background: #fff; border: 1px solid #e8edf3; border-left: 4px solid #f59e0b; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 11px; transition: box-shadow .15s; }
            .ap-leave-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
            .ap-leave-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
            .ap-leave-title { font-size: 14.5px; font-weight: 700; color: #1e293b; }
            .ap-leave-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
            .ap-leave-status { display: inline-flex; align-items: center; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; border: 1px solid; white-space: nowrap; }
            .ap-leave-meta { display: flex; flex-wrap: wrap; gap: 6px; }
            .ap-leave-meta span { display: inline-flex; align-items: center; font-size: 11.5px; color: #64748b; background: #f8fafc; border: 1px solid #e8edf3; border-radius: 6px; padding: 3px 8px; }
            .ap-leave-reason { font-size: 12.5px; color: #64748b; line-height: 1.5; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #c9d0d4d0; }
            .ap-leave-approvals { display: flex; flex-wrap: wrap; gap: 6px; }
            .ap-approval-pill { display: inline-flex; font-size: 11.5px; font-weight: 600; color: #64748b; background: #f8fafc; border: 1px solid #c9d0d4d0; border-radius: 6px; padding: 3px 8px; }
            .ap-approval-pill.ok { color: #16a34a; background: #f0fdf4; border-color: #bbf7d0; }
            .ap-approval-pill.no { color: #dc2626; background: #fef2f2; border-color: #fecaca; }
            .ap-leave-rejection { font-size: 12px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 7px 10px; line-height: 1.4; }
            .ap-leave-actions { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
            .ap-btn-approve, .ap-btn-reject { display: inline-flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 700; padding: 7px 14px; border-radius: 7px; cursor: pointer; transition: background .15s; border: 1px solid; }
            .ap-btn-approve { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
            .ap-btn-approve:hover:not(:disabled) { background: #dcfce7; }
            .ap-btn-reject  { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
            .ap-btn-reject:hover:not(:disabled)  { background: #fee2e2; }
            .ap-btn-approve:disabled, .ap-btn-reject:disabled { opacity: .6; cursor: not-allowed; }
            .ap-saving, .ap-leave-done { font-size: 12px; color: #94a3b8; font-style: italic; }

            /* Shared */
            .op-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; color: #94a3b8; gap: 12px; text-align: center; }
            .op-empty-text  { font-size: 13.5px; }
            .op-spinner { width: 32px; height: 32px; border: 3px solid #c9d0d4d0; border-top-color: #dc2626; border-radius: 50%; animation: spin .7s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }

            /* Toast */
            .ap-toast { position: fixed; bottom: 28px; right: 28px; z-index: 9999; display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,.15); animation: slideUp .25s ease; }
            .ap-toast-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
            .ap-toast-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
            @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

            /* FAB */
            .ap-fab { position: fixed; bottom: 32px; right: 32px; z-index: 999; width: 52px; height: 52px; border-radius: 50%; background: #dc2626; color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(220,38,38,.4); transition: transform .2s, box-shadow .2s; }
            .ap-fab:hover  { transform: scale(1.08); box-shadow: 0 6px 28px rgba(220,38,38,.5); }
            .ap-fab:Active { transform: scale(.96); }

            /* Modal */
            .ap-modal-backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(15,23,42,.45); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px; }
            .ap-modal { margin-top:50px; background: #fff; border-radius: 16px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2); display: flex; flex-direction: column; }
            .ap-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: #fff; z-index: 1; border-radius: 16px 16px 0 0; }
            .ap-modal-title { font-size: 16px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 9px; }
            .ap-modal-title-icon { width: 32px; height: 32px; border-radius: 8px; background: #fef2f2; display: flex; align-items: center; justify-content: center; color: #dc2626; }
            .ap-modal-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #c9d0d4d0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: background .15s; }
            .ap-modal-close:hover { background: #f1f5f9; }
            .ap-modal-body { padding: 24px; }

            @media (max-width: 900px) {
              .op-main { padding: 22px 22px 28px; }
              .op-content-card { padding: 22px; border-radius: 12px; }
              .op-profile-card { padding: 20px 22px; align-items: flex-start; }
              .ap-stats-row { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
              .ap-leave-grid { grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); }
              .tf-date { width: 120px; }
            }
            @media (max-width: 760px) {
              .op-body { display: block; min-height: calc(100vh - 60px); background: #c9d0d4d0; }
              .op-sidebar { position: fixed; top: 0; left: 0; z-index: 10020; height: 100vh; width: min(84vw, 300px); min-width: 0; transform: translateX(0); opacity: 1; box-shadow: 12px 0 34px rgba(15,23,42,.18); transition: transform .22s ease, opacity .18s ease; }
              .op-sidebar.collapsed { width: min(84vw, 300px); min-width: 0; transform: translateX(-105%); opacity: 0; pointer-events: none; }
              .op-sidebar-close { display: inline-flex; }
              .op-sidebar-backdrop { display: block; position: fixed; inset: 0; z-index: 10010; background: rgba(15,23,42,.38); backdrop-filter: blur(2px); border: none; padding: 0; }
              .op-main { padding: 16px 14px 24px; overflow: visible; }
              .op-topbar { margin-bottom: 16px; gap: 10px; }
              .op-toggle-btn { width: 38px; height: 38px; }
              .op-profile-card { margin-bottom: 16px; padding: 16px; border-radius: 10px; gap: 12px; }
              .op-avatar { width: 44px; height: 44px; font-size: 18px; }
              .op-content-card { padding: 16px; border-radius: 10px; min-height: 240px; }
              .op-content-header { margin-bottom: 16px; padding-bottom: 12px; }
              .ap-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
              .ap-stats-row .ap-stat-card:last-child { grid-column: 1 / -1; }
              .ap-leave-summary { grid-template-columns: 1fr; gap: 10px; margin-bottom: 16px; }
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
              .ap-fab { bottom: 20px; right: 16px; width: 48px; height: 48px; }
              .ap-modal-backdrop { padding: 0; align-items: flex-end; }
              .ap-modal { border-radius: 16px 16px 0 0; max-height: 92vh; }
              .ap-toast { left: 14px; right: 14px; bottom: 16px; justify-content: center; }
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
              .ap-recurrence-pills { grid-template-columns: 1fr; }
              .ap-weekday-grid { grid-template-columns: repeat(3,minmax(0,1fr)); }
            }
              .op-header-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
              .op-content-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap; }

              .tf-bar-inline { position:fixed; top:120px; right:90px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-left: auto; background: #c9d0d4dc; padding: 10px; border-radius: 10px; }
              .tf-mobile-btn { display: none; width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; cursor: pointer; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
              .tf-mobile-btn.Active { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
              .tf-mobile-badge { position: absolute; top: -4px; right: -4px; width: 8px; height: 8px; background: #dc2626; border-radius: 50%; }
              .tf-popup { position: absolute; top: calc(100% + 8px); right: 0; z-index: 200; background: #c9d0d4d0; border: 1px solid #c9d0d4d0; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.12); padding: 14px; width: 290px; }

              @media (max-width: 760px) {
                 .tf-bar-inline { display: none !important; }
                .tf-mobile-btn { display: inline-flex !important; }
                .tf-popup .tf-group { width: 100%; }
                .tf-popup .tf-select, .tf-popup .tf-date { width: 100%; }
                .tf-popup .tf-clear { width: 100%; justify-content: center; margin-left: 0; }
                .tf-popup .tf-divider { display: none; }
              }
            .op-nav-section { font-size: 10px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: #000000; padding: 12px 12px 4px; }

            .ap-edit-btn { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 10px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; color: #2563eb; transition: background .15s; }
            .ap-edit-btn:hover { background: #dbeafe; }
            @media (max-width: 760px) {
             .tf-bar-fixed { display: none; }
            .recurring-desktop-bar { display: none !important; }
            }
              .recurring-mobile-filter-btn { display: none; }
              .recurring-desktop-bar { display: flex; }

              @media (max-width: 760px) {
                .recurring-mobile-filter-btn { display: inline-flex; }
                .recurring-desktop-bar { display: none !important; }
              }
          `}</style>

      <div className="op-root">
        <Navbar
          onMenuToggle={() => setSidebarOpen((p) => !p)}
          menuOpen={sidebarOpen}
        />

        {toast && (
          <div className={`ap-toast ap-toast-${toast.type}`}>
            {toast.type === "success" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {toast.msg}
          </div>
        )}

        <div className="op-body">
          {sidebarOpen && (
            <button
              className="op-sidebar-backdrop"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside className={`op-sidebar${sidebarOpen ? "" : " collapsed"}`}>
            <div className="op-sidebar-header">
              <button
                className="op-sidebar-close"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="op-nav">
              {NAV_ITEMS.slice(0, 6).map((item) => (
                <button
                  key={item.key}
                  className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                  {item.key === "leave-requests" &&
                    leavePendingForAdmin > 0 && (
                      <span className="op-nav-badge">
                        {leavePendingForAdmin}
                      </span>
                    )}
                  {item.key === "reschedule-requests" && reschedPending > 0 && (
                    <span className="op-nav-badge">{reschedPending}</span>
                  )}
                </button>
              ))}
              <span className="op-nav-section">Task Verification</span>
                {VERIFICATION_NAV.map((item) => (
                  <button
                    key={item.key}
                    className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                    onClick={() => handleNavClick(item.key)}
                  >
                    <span className="op-nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <span className="op-nav-section">Ticket Raised</span>
                {TICKETS_NAV.map((item) => (
                  <button
                    key={item.key}
                    className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                    onClick={() => handleNavClick(item.key)}
                  >
                    <span className="op-nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              <span className="op-nav-section">Employee Management</span>
              {NAV_ITEMS.slice(6, 8).map((item) => (
                <button
                  key={item.key}
                  className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <span className="op-nav-section">Site Management</span>
              {NAV_ITEMS.slice(8).map((item) => (
                <button
                  key={item.key}
                  className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <span className="op-nav-section">Drawings & Reports</span>
                {REPORTS_NAV.map((item) => (
                  <button
                    key={item.key}
                    className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
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
                {activeTab === "all-tasks" && (
                  <>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: showRecurringInAllTasks ? "#2563eb" : "#64748b",
                        background: showRecurringInAllTasks
                          ? "#eff6ff"
                          : "#f8fafc",

                        borderRadius: 8,
                        padding: "7px 12px",
                        transition: "all .15s",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 18,
                          borderRadius: 99,
                          background: showRecurringInAllTasks
                            ? "#2563eb"
                            : "#c9d0d4d0",
                          position: "relative",
                          transition: "background .2s",
                          flexShrink: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={showRecurringInAllTasks}
                          onChange={(e) =>
                            setShowRecurringInAllTasks(e.target.checked)
                          }
                          style={{ display: "none" }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            left: showRecurringInAllTasks ? 16 : 2,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "#fff",
                            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                            transition: "left .2s",
                          }}
                        />
                      </span>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                      Include recurring
                    </label>

                    <TaskFilterBar
                      filters={taskFilters}
                      onChange={(key, val) => {
                        setTaskFilters((prev) => {
                          const next = { ...prev, [key]: val };
                          const base = applyTaskFilters(baseAllTasks, {
                            ...next,
                          });
                          if (
                            next.site &&
                            !base.some((t) => t.site_name === next.site)
                          )
                            next.site = "";
                          if (
                            next.priority &&
                            !base.some((t) => t.priority === next.priority)
                          )
                            next.priority = "";
                          if (
                            next.status &&
                            !base.some((t) => t.status === next.status)
                          )
                            next.status = "";
                          if (
                            next.assignedTo &&
                            !base.some((t) => t.assigned_to === next.assignedTo)
                          )
                            next.assignedTo = "";
                          return next;
                        });
                      }}
                      onClear={() => setTaskFilters({ ...EMPTY_TASK_FILTERS })}
                      sites={tfSites}
                      priorities={tfPriorities}
                      statuses={tfStatuses}
                      assignees={tfAssignees}
                      inline={true}
                      mobileOpen={mobileFilterOpen}
                      onMobileToggle={() => setMobileFilterOpen((p) => !p)}
                    />
                  </>
                )}
              </div>
              {renderContent()}
            </div>
          </main>
        </div>

        {/* FAB — dashboard and all-tasks tabs */}
        {(activeTab === "dashboard" || activeTab === "all-tasks") && (
          <button
            className="ap-fab"
            onClick={() => setShowTaskModal(true)}
            title="Assign new task"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}

        {/* Assign Task Modal */}
        {showTaskModal && (
          <div
            className="ap-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTaskModal(false);
            }}
          >
            <div className="ap-modal">
              <div className="ap-modal-header">
                <div className="ap-modal-title">
                  <div className="ap-modal-title-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  Assign New Task
                </div>
                <button
                  className="ap-modal-close"
                  onClick={() => setShowTaskModal(false)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="ap-modal-body">
                <TaskFormWithCheckpoints
                  form={form}
                  handleFormChange={handleFormChange}
                  setForm={setForm}
                  handleSubmit={handleSubmit}
                  submitting={submitting}
                  onSuccess={() => setShowTaskModal(false)}
                  employees={assignableEmployees}
                  sites={sites}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {detailTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10030,
            background: "rgba(15,23,42,.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailTask(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 540,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                padding: "18px 22px 14px",
                borderBottom: "1px solid #f1f5f9",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
                borderRadius: "16px 16px 0 0",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1e293b",
                    lineHeight: 1.3,
                  }}
                >
                  {detailTask.title}
                </div>
                {detailTask.site_name && (
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                    {detailTask.site_name}
                  </div>
                )}
              </div>
              <button
                onClick={() => setDetailTask(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(() => {
                  const p =
                    PRIORITY_STYLES[detailTask.priority] ||
                    PRIORITY_STYLES.medium;
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: p.bg,
                        color: p.color,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: p.dot,
                          flexShrink: 0,
                        }}
                      />
                      {detailTask.priority} priority
                    </span>
                  );
                })()}
                {(() => {
                  const s =
                    STATUS_STYLES[detailTask.status] || STATUS_STYLES.pending;
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: s.bg,
                        color: s.color,
                      }}
                    >
                      {detailTask.status
                        ?.replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  );
                })()}
                {detailTask.is_recurring && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: "#eff6ff",
                      color: "#2563eb",
                    }}
                  >
                    {anchorDescription(
                      detailTask.recurrence,
                      detailTask.recurrence_anchor,
                    ) || detailTask.recurrence}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  {
                    label: "Assigned To",
                    value: nameFor(userMap, detailTask.assigned_to),
                  },
                  {
                    label: "Given By",
                    value: nameFor(userMap, detailTask.assigned_by),
                  },
                  { label: "Site", value: detailTask.site_name || "—" },
                  {
                    label: "Due Date",
                    value: detailTask.due_date
                      ? new Date(detailTask.due_date).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e8edf3",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {detailTask.description && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e8edf3",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "#94a3b8",
                      marginBottom: 8,
                    }}
                  >
                    Description
                  </div>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "#475569",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {detailTask.description}
                  </p>
                </div>
              )}

              {detailTask.audio_url && (
                <div
                  style={{
                    background: "#f5f3ff",
                    border: "1px solid #e0e7ff",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "#7c3aed",
                      marginBottom: 10,
                    }}
                  >
                    Audio Instruction
                  </div>
                  <audio
                    controls
                    src={detailTask.audio_url}
                    style={{ width: "100%", borderRadius: 8, outline: "none" }}
                  />
                </div>
              )}

              {detailTask.document_url && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "#2563eb",
                      marginBottom: 10,
                    }}
                  >
                    Attached Document
                  </div>
                  <a
                    href={detailTask.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#2563eb",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "9px 16px",
                      borderRadius: 8,
                      textDecoration: "none",
                    }}
                  >
                    Open / Download Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {rejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10040,
            background: "rgba(15,23,42,.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectModal(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 22px 14px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}
                >
                  Reject Reschedule Request
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {rejectModal.req.tasks?.title ||
                    `Task #${rejectModal.req.task_id}`}
                  {" · "}Requested by{" "}
                  <strong style={{ color: "#64748b" }}>
                    {rejectModal.req.requested_by}
                  </strong>
                </div>
              </div>
              <button
                onClick={() => setRejectModal(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Request summary */}
            <div style={{ padding: "16px 22px 0" }}>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e8edf3",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Current due:
                  <strong style={{ color: "#1e293b", marginLeft: 5 }}>
                    {rejectModal.req.current_due
                      ? new Date(
                          rejectModal.req.current_due + "T00:00:00",
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </strong>
                </div>
                <div style={{ fontSize: 12, color: "#7c3aed" }}>
                  Requested:
                  <strong style={{ marginLeft: 5 }}>
                    {new Date(
                      rejectModal.req.requested_date + "T00:00:00",
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                {rejectModal.req.reason && (
                  <div
                    style={{
                      width: "100%",
                      fontSize: 12,
                      color: "#64748b",
                      fontStyle: "italic",
                    }}
                  >
                    "{rejectModal.req.reason}"
                  </div>
                )}
              </div>
            </div>

            {/* Reason textarea */}
            <div
              style={{
                padding: "16px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}
              >
                Reason for Rejection <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Explain why this reschedule request is being rejected…"
                autoFocus
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  color: "#1e293b",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "9px 12px",
                  outline: "none",
                  width: "100%",
                  resize: "vertical",
                  minHeight: 90,
                  transition: "border .15s",
                }}
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((p) => ({ ...p, reason: e.target.value }))
                }
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.boxShadow = "0 0 0 3px rgba(220,38,38,.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                This message will be shown to the employee.
              </span>
            </div>

            {/* Footer buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "12px 22px 18px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() => setRejectModal(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f1f5f9",
                  color: "#475569",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectModal.reason.trim()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: rejectModal.reason.trim() ? "#dc2626" : "#f1f5f9",
                  color: rejectModal.reason.trim() ? "#fff" : "#94a3b8",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: rejectModal.reason.trim() ? "pointer" : "not-allowed",
                  transition: "background .15s, color .15s",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
