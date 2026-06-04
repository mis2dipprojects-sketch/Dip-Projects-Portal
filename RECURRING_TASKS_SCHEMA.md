# Recurring Task Auto-Generation - Database Schema Updates

To enable automatic recurring task generation, add the following columns to your `tasks` table in Supabase:

## Required Columns

### 1. `last_instance_date` (date, nullable)
- **Description**: Tracks the date when the last instance of this recurring task was generated
- **Default**: NULL
- **Used for**: Determining if a new instance needs to be created
- **SQL**: `ALTER TABLE tasks ADD COLUMN last_instance_date DATE;`

### 2. `parent_recurring_id` (uuid, nullable)
- **Description**: References the original recurring task that this is an instance of
- **Default**: NULL
- **Used for**: Linking automatically generated task instances to their parent
- **SQL**: `ALTER TABLE tasks ADD COLUMN parent_recurring_id UUID REFERENCES tasks(id) ON DELETE CASCADE;`

## Existing Columns Used

The auto-generation feature uses these existing columns:
- `due_date` - Base date for calculating next occurrence
- `is_recurring` - Boolean flag indicating if task is recurring
- `recurrence` - String enum: 'daily', 'weekly', 'monthly', 'yearly'
- `assigned_to` - Who the task is assigned to
- `assigned_by` - Who assigned the task
- `status` - Current status (pending, in_progress, completed)

## How It Works

1. **Daily Tasks**: New instance created every 24 hours from the last instance date
2. **Weekly Tasks**: New instance created on the same day of the week, each week
3. **Monthly Tasks**: New instance created on the same date each month
4. **Yearly Tasks**: New instance created on the same date and month each year

## Auto-Generation Trigger

- Tasks are checked when the Office Portal is loaded
- New instances are automatically created if the due date for the next occurrence has passed
- Each new instance is marked with `parent_recurring_id` pointing to the original task
- Multiple instances can exist if the original task is not completed

## Example

A "Daily Standup" recurring task created on 2024-06-03:
- Original task: `is_recurring=true, recurrence='daily', due_date='2024-06-03'`
- On 2024-06-04 (next day): New instance auto-created with `parent_recurring_id=original_id, due_date='2024-06-04'`
- On 2024-06-05: Another new instance created even if the 2024-06-04 task is not completed
- This pattern continues daily
