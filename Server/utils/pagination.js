// Shared list-query helpers. Every admin list is paginated and every search
// term is treated as text, never as a regex the caller can inject.
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export function parsePagination(query = {}) {
  const rawPage = Number.parseInt(query.page, 10);
  const rawLimit = Number.parseInt(query.limit, 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, MAX_LIMIT)
      : DEFAULT_LIMIT;
  return { page, limit, skip: (page - 1) * limit };
}

export function pageMeta(total, page, limit) {
  const safeTotal = Number(total) || 0;
  return {
    page,
    limit,
    total: safeTotal,
    pages: Math.max(1, Math.ceil(safeTotal / limit)),
  };
}

export function escapeRegex(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function regexFor(value) {
  return new RegExp(escapeRegex(value).trim(), "i");
}

// Parses ?verified=true/false without letting "false" become truthy.
export function parseBoolean(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
}
