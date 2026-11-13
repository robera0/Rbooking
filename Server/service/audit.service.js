import { AuditLog } from "../models/auditLog.model.js";

// Best-effort audit trail. A logging problem must never fail the action the
// admin actually asked for, so this swallows and reports its own errors.
export async function recordAudit({
  req,
  action,
  entityType = "",
  entityId = "",
  message = "",
  metadata = {},
  before = undefined,
  after = undefined,
}) {
  try {
    const actor = req?.user || {};
    await AuditLog.create({
      actorId: actor.id || null,
      actorEmail: actor.email || "",
      actorRole: actor.role || "",
      action,
      entityType,
      entityId: entityId ? String(entityId) : "",
      message,
      metadata: {
        ...metadata,
        ...(before !== undefined ? { before } : {}),
        ...(after !== undefined ? { after } : {}),
      },
      ip: req?.ip || req?.headers?.["x-forwarded-for"] || "",
      userAgent: req?.headers?.["user-agent"] || "",
    });
  } catch (error) {
    console.error("[audit] failed to record", action, error.message);
  }
}
