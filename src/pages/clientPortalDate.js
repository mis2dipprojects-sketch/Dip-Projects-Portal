export function dayKeyOf(iso) {
  if (!iso && iso !== 0) return null;

  const raw = String(iso).trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    if (year && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return raw;
    }
    return null;
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function monthKeyOf(dateStr) {
  const dayKey = dayKeyOf(dateStr);
  if (!dayKey) return null;
  return `${dayKey.slice(0, 4)}-${dayKey.slice(5, 7)}`;
}
