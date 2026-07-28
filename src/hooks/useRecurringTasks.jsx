
import { useEffect } from "react";
import {
  RecurringTaskInstancesAPI,
  RecurringTasksAPI,
} from "../api/tasks";

// ── helpers ────────────────────────────────────────────────────────────────

/** Returns today's date as a YYYY-MM-DD string (local time, no UTC shift). */
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Add `n` days to a YYYY-MM-DD string and return a new YYYY-MM-DD string. */
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Given a recurrence pattern + anchor, should today trigger a new instance? */
function shouldTriggerToday(recurrence, anchor) {
  const now = new Date();
  switch (recurrence) {
    case "daily":
      return true;

    case "weekly": {
      // anchor = "0"–"6"  (JS getDay weekday)
      const targetDay = parseInt(anchor, 10);
      return now.getDay() === targetDay;
    }

    case "monthly": {
      // anchor = "1"–"31" (day of month)
      const targetDom = parseInt(anchor, 10);
      return now.getDate() === targetDom;
    }

    case "yearly": {
      // anchor = "MM-DD" e.g. "03-25"
      if (!anchor) return false;
      const [mm, dd] = anchor.split("-");
      return now.getMonth() + 1 === parseInt(mm, 10) && now.getDate() === parseInt(dd, 10);
    }

    default:
      return false;
  }
}

/** Compute the due_date for the new instance (one cycle ahead of today). */
function nextDueDate(recurrence) {
  const today = todayStr();
  switch (recurrence) {
    case "daily":
      return addDays(today, 1);
    case "weekly":
      return addDays(today, 7);
    case "monthly": {
      const d = new Date(today + "T00:00:00");
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().slice(0, 10);
    }
    case "yearly": {
      const d = new Date(today + "T00:00:00");
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().slice(0, 10);
    }
    default:
      return null;
  }
}

// ── main hook ──────────────────────────────────────────────────────────────

/**
 * @param {object|null} user   – the logged-in user from localStorage
 * @param {function}    onDone – optional callback after generation (e.g. refetch instances)
 */
export function useRecurringTasks(user, onDone) {
  useEffect(() => {
    if (!user) return;
    processRecurringTasks(user, onDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_name]);
}

async function processRecurringTasks(user, onDone) {
  const today = todayStr();

  // Fetch active templates. Admin triggers generation for everyone; the
  // office portal can call this too (harmless — same de-dup guard applies
  // regardless of who triggers it).
  let templates;
  try {
    templates = await RecurringTasksAPI.listActive();
  } catch (error) {
    console.error("Failed to load recurring task templates", error);
    return;
  }

  if (!templates.length) return;

  const toGenerate = templates.filter((template) => {
    // Already generated today → skip
    if (template.last_generated_date === today) return false;
    // Check if today matches the recurrence pattern
    return shouldTriggerToday(template.recurrence, template.recurrence_anchor);
  });

  if (!toGenerate.length) return;

  for (const template of toGenerate) {
    // Check if the most recent instance for this template is still incomplete
    // (used only to annotate the new instance — we still spawn either way).
    let lastInstance = null;
    try {
      [lastInstance] = await RecurringTaskInstancesAPI.listForRecurringTask(template.id);
    } catch (error) {
      console.error("Failed to load recurring task instances", error);
      continue;
    }

    const prevIncomplete = lastInstance && lastInstance.status === "pending";

    // Build the new instance — fields are copied from the template at spawn
    // time so later edits to the template don't rewrite history.
    const newInstance = {
      recurring_task_id: template.id,
      title: template.title,
      description: prevIncomplete
        ? (template.description ? template.description + "\n\n" : "") +
          "⚠️ Previous instance was not completed."
        : template.description,
      assigned_to: template.assigned_to,
      assigned_by: template.assigned_by,
      site_name: template.site_name,
      priority: template.priority,
      status: "pending",
      due_date: nextDueDate(template.recurrence),
      hours_to_complete: template.hours_to_complete,
      audio_url: template.audio_url,
      document_url: template.document_url,
      has_checkpoints: template.has_checkpoints,
      reschedule_allowed: template.reschedule_allowed,
    };

    // Insert the new instance
    try {
      await RecurringTaskInstancesAPI.create(newInstance);
    } catch (error) {
      console.error("Failed to spawn recurring instance for", template.id, error);
      continue; // don't stamp last_generated_date if the insert failed
    }

    // Stamp the template so we don't re-generate today
    try {
      await RecurringTasksAPI.markGenerated(template.id, today);
    } catch (error) {
      console.error("Failed to stamp recurring task", template.id, error);
    }
  }

  // Notify caller (e.g. refetch instance lists)
  if (typeof onDone === "function") onDone();
}
