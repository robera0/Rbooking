// Reads the "show available tickets" setting from a request body, where it may
// arrive as a boolean or as a form string. Returns undefined when it was not
// sent, so an update leaves the stored value alone and a new event gets the
// schema default (on).
export const parseShowAvailability = (value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value !== "string") return undefined;
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return undefined;
};
