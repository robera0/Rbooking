// The create page autosaves with status "draft" every few seconds. A draft
// save that is still in flight when the organizer clicks Publish can reach the
// server after the publish and flip the event back to draft. A published event
// is therefore never moved back to draft by a save; every other change passes.
export function resolveStatusUpdate(currentStatus, incomingStatus) {
  if (currentStatus === "published" && incomingStatus === "draft") return undefined;
  return incomingStatus;
}
