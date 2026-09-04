const FRIENDLY_ERROR_MAP = {
  "Failed to create draft":
    "We couldn’t save your draft right now. Please try again.",
  "Failed to update draft": "We couldn’t update your draft. Please try again.",
  "Failed to create event": "We couldn’t publish your event. Please try again.",
  "Failed to publish event":
    "We couldn’t publish your event. Please try again.",
  "Failed to create tickets":
    "Your event was created, but the tickets could not be saved. Please try again.",
  "Failed to update event": "We couldn’t update this event. Please try again.",
  "Login required": "Please sign in to continue.",
  Unauthorized: "You’re not authorized to perform this action.",
  Forbidden: "You don’t have permission to do that.",
  "Network request failed":
    "We couldn’t reach the server. Please check your connection and try again.",
};

const normalizeMessage = (message = "") => {
  if (!message) return "Something went wrong. Please try again.";

  const cleaned = String(message).replace(/\s+/g, " ").trim();

  if (FRIENDLY_ERROR_MAP[cleaned]) return FRIENDLY_ERROR_MAP[cleaned];

  if (/not found/i.test(cleaned)) {
    return "The requested item could not be found. Please refresh and try again.";
  }

  if (/network|fetch|failed to fetch|timeout/i.test(cleaned)) {
    return "We couldn’t reach the server. Please check your connection and try again.";
  }

  if (/401|403|unauthorized|forbidden/i.test(cleaned)) {
    return "You don’t have permission to complete this action.";
  }

  if (/validation|required|must be|already exists|duplicate/i.test(cleaned)) {
    return cleaned;
  }

  return "Something went wrong. Please try again.";
};

export function getFriendlyErrorMessage(error) {
  if (!error) return "Something went wrong. Please try again.";

  if (typeof error === "string") return normalizeMessage(error);

  if (error?.response?.data?.message) {
    return normalizeMessage(error.response.data.message);
  }
  if (error?.response?.data?.error) {
    return normalizeMessage(error.response.data.error);
  }
  if (error?.message) return normalizeMessage(error.message);

  return "Something went wrong. Please try again.";
}
