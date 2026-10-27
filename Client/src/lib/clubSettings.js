const STORAGE_KEY = "clubSettings";

export const CLUB_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const defaultOpeningHours = () =>
  CLUB_DAYS.map((_, day) => ({
    day,
    isOpen: day >= 4,
    opensAt: "21:00",
    closesAt: "04:00",
  }));

export function loadClubSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return {
      openingHours:
        Array.isArray(parsed?.openingHours) && parsed.openingHours.length === 7
          ? parsed.openingHours
          : defaultOpeningHours(),
      acceptsReservations: parsed?.acceptsReservations !== false,
      holdMinutes: Number(parsed?.holdMinutes) || 30,
    };
  } catch {
    return { openingHours: defaultOpeningHours(), acceptsReservations: true, holdMinutes: 30 };
  }
}

export function saveClubSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("club-settings-updated"));
}

export function isClubOpenOnDate(dateValue, settings = loadClubSettings()) {
  if (!dateValue) return false;
  const day = new Date(`${dateValue}T12:00:00`).getDay();
  return Boolean(settings.openingHours?.[day]?.isOpen);
}

export function getHoursForDate(dateValue, settings = loadClubSettings()) {
  if (!dateValue) return null;
  const day = new Date(`${dateValue}T12:00:00`).getDay();
  return settings.openingHours?.[day] || null;
}

export function readClubReservations() {
  try {
    const parsed = JSON.parse(localStorage.getItem("clubRsvpReservations") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isActiveReservation(reservation) {
  return !["left", "completed", "cancelled", "expired"].includes(
    String(reservation?.status || "paid").toLowerCase(),
  );
}

export function isSeatReserved(tableId, date, reservations = readClubReservations()) {
  return reservations.some(
    (reservation) =>
      reservation.table === tableId &&
      reservation.date === date &&
      isActiveReservation(reservation),
  );
}
