// taskTables.js — CRUD for tasks, recurring_tasks, recurring_task_instances
import { supabase } from "../supabase";

// ══════════════════════════ ONE-TIME TASKS ══════════════════════════
export const TasksAPI = {
  async list() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, patch) {
    const { data, error } = await supabase
      .from("tasks")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },
};

// ══════════════════════════ RECURRING TASK TEMPLATES ══════════════════════════
export const RecurringTasksAPI = {
  async list() {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, patch) {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    // cascades to recurring_task_instances via FK
    const { error } = await supabase
      .from("recurring_tasks")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async pause(id) {
    return RecurringTasksAPI.update(id, { status: "paused" });
  },

  async resume(id) {
    return RecurringTasksAPI.update(id, { status: "active" });
  },
};

// ══════════════════════════ RECURRING TASK INSTANCES ══════════════════════════
export const RecurringInstancesAPI = {
  async list() {
    const { data, error } = await supabase
      .from("recurring_task_instances")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async listByRecurringTask(recurringTaskId) {
    const { data, error } = await supabase
      .from("recurring_task_instances")
      .select("*")
      .eq("recurring_task_id", recurringTaskId)
      .order("due_date", { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from("recurring_task_instances")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from("recurring_task_instances")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, patch) {
    const { data, error } = await supabase
      .from("recurring_task_instances")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase
      .from("recurring_task_instances")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // Spawns the next occurrence from a template and bumps last_generated_date
  async spawnNext(recurringTask, nextDue) {
    const { data: instance, error } = await supabase
      .from("recurring_task_instances")
      .insert([
        {
          recurring_task_id: recurringTask.id,
          title: recurringTask.title,
          description: recurringTask.description,
          assigned_to: recurringTask.assigned_to,
          assigned_by: recurringTask.assigned_by,
          site_name: recurringTask.site_name,
          priority: recurringTask.priority,
          status: "pending",
          due_date: nextDue,
          audio_url: recurringTask.audio_url,
          document_url: recurringTask.document_url,
          has_checkpoints: recurringTask.has_checkpoints,
          reschedule_allowed: recurringTask.reschedule_allowed,
          hours_to_complete: recurringTask.hours_to_complete,
        },
      ])
      .select()
      .single();
    if (error) throw error;

    await supabase
      .from("recurring_tasks")
      .update({ last_generated_date: nextDue })
      .eq("id", recurringTask.id);

    return instance;
  },
};