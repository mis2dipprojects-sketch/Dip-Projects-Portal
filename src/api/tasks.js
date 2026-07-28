import { supabase } from "../supabase";

/**
 * Small shared CRUD factory.  Keeping the table name inside each exported API
 * prevents a recurring-task template or an occurrence from being written to
 * the normal `tasks` table by mistake.
 */
function createCrudApi(table) {
  return {
    async list(filters = {}) {
      let query = supabase.from(table).select("*");

      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) query = query.eq(column, value);
      });

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async getById(id) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, patch) {
      const { data, error } = await supabase
        .from(table)
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
  };
}

const tasksCrud = createCrudApi("tasks");
export const TasksAPI = {
  ...tasksCrud,
  listForUser: (username) => tasksCrud.list({ assigned_to: username }),
  listAll: () => tasksCrud.list(),
  setStatus: (id, status) => tasksCrud.update(id, { status }),
  reassign: (id, assigned_to) => tasksCrud.update(id, { assigned_to }),
  reschedule: (id, due_date) => tasksCrud.update(id, { due_date }),
  accept: (id) => {
    const now = new Date().toISOString();
    return tasksCrud.update(id, {
      accepted_at: now,
      is_held: false,
      hold_started_at: null,
      resumed_at: now,
    });
  },
  hold: (id, accumulated_seconds) =>
    tasksCrud.update(id, {
      is_held: true,
      hold_started_at: new Date().toISOString(),
      accumulated_seconds,
    }),
  resume: (id) =>
    tasksCrud.update(id, {
      is_held: false,
      hold_started_at: null,
      resumed_at: new Date().toISOString(),
    }),
};

const recurringTasksCrud = createCrudApi("recurring_tasks");
export const RecurringTasksAPI = {
  ...recurringTasksCrud,
  listAll: () => recurringTasksCrud.list(),
  listActive: () => recurringTasksCrud.list({ is_active: true }),
  listForUser: (username) => recurringTasksCrud.list({ assigned_to: username }),
  setActive: (id, is_active) => recurringTasksCrud.update(id, { is_active }),
  markGenerated: (id, last_generated_date) =>
    recurringTasksCrud.update(id, { last_generated_date }),
};

const recurringInstancesCrud = createCrudApi("recurring_task_instances");
export const RecurringTaskInstancesAPI = {
  ...recurringInstancesCrud,
  listAll: () => recurringInstancesCrud.list(),
  listForUser: (username) => recurringInstancesCrud.list({ assigned_to: username }),
  listForRecurringTask: (recurringTaskId) =>
    recurringInstancesCrud.list({ recurring_task_id: recurringTaskId }),
  setStatus: (id, status) => recurringInstancesCrud.update(id, { status }),
  reassign: (id, assigned_to) => recurringInstancesCrud.update(id, { assigned_to }),
  reschedule: (id, due_date) => recurringInstancesCrud.update(id, { due_date }),
  accept: (id) => {
    const now = new Date().toISOString();
    return recurringInstancesCrud.update(id, {
      accepted_at: now,
      is_held: false,
      hold_started_at: null,
      resumed_at: now,
    });
  },
  hold: (id, accumulated_seconds) =>
    recurringInstancesCrud.update(id, {
      is_held: true,
      hold_started_at: new Date().toISOString(),
      accumulated_seconds,
    }),
  resume: (id) =>
    recurringInstancesCrud.update(id, {
      is_held: false,
      hold_started_at: null,
      resumed_at: new Date().toISOString(),
    }),
};
