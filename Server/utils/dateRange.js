const DAY_MS = 24 * 60 * 60 * 1000;

// Ethiopia is UTC+3 all year (no DST), so a fixed offset is correct here and
// keeps "today" aligned with what admins see in Addis Ababa.
const ADDIS_OFFSET_MS = 3 * 60 * 60 * 1000;

export function startOfToday(now = new Date()) {
  const local = new Date(now.getTime() + ADDIS_OFFSET_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) -
      ADDIS_OFFSET_MS,
  );
}

// Accepts ?range=7d|30d|90d|all|today or an explicit ?from=&to= pair.
export function parseRange(query = {}, defaultDays = 30) {
  const now = new Date();
  const rawTo = query.to ? new Date(query.to) : now;
  const to = Number.isNaN(rawTo.getTime()) ? now : rawTo;

  let from;
  if (query.from) {
    const rawFrom = new Date(query.from);
    from = Number.isNaN(rawFrom.getTime())
      ? new Date(to.getTime() - defaultDays * DAY_MS)
      : rawFrom;
  } else if (query.range === "all") {
    from = new Date(0);
  } else if (query.range === "today") {
    from = startOfToday(to);
  } else {
    const match = /^(\d{1,3})d$/.exec(String(query.range ?? ""));
    const days = match ? Math.max(1, Number(match[1])) : defaultDays;
    from = new Date(to.getTime() - days * DAY_MS);
  }

  if (from.getTime() > to.getTime()) {
    return { from: to, to: from };
  }
  return { from, to };
}

export { DAY_MS, ADDIS_OFFSET_MS };
