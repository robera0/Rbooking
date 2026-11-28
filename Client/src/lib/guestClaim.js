// A guest who buys a ticket (or gets a free one) without an account keeps an
// unclaimed purchase under a short-lived claim token. Once they verify their
// payment - or simply acquire a free ticket - they are asked to log in or sign
// up; on success the ticket is claimed with this token and saved to the new
// account. The claim intent lives in sessionStorage so it survives the trip
// through the login / signup screens.
export const GUEST_CLAIM_STORAGE_KEY = "guestTicketClaim";

export const saveGuestClaim = (claim) => {
  if (!claim?.userTicketId) return;
  try {
    sessionStorage.setItem(
      GUEST_CLAIM_STORAGE_KEY,
      JSON.stringify({
        userTicketId: String(claim.userTicketId),
        claimToken: claim.claimToken || "",
        eventId: claim.eventId || "",
        eventName: claim.eventName || "",
        totalAmount: claim.totalAmount ?? 0,
        quantity: claim.quantity ?? 1,
      }),
    );
  } catch {
    // sessionStorage can be unavailable (private mode); nothing else to do.
  }
};

export const readGuestClaim = () => {
  try {
    const raw = sessionStorage.getItem(GUEST_CLAIM_STORAGE_KEY);
    if (!raw) return null;
    const claim = JSON.parse(raw);
    if (!claim?.userTicketId || !claim?.claimToken) return null;
    return claim;
  } catch {
    return null;
  }
};

export const clearGuestClaim = () => {
  try {
    sessionStorage.removeItem(GUEST_CLAIM_STORAGE_KEY);
  } catch {
    // ignore
  }
};
