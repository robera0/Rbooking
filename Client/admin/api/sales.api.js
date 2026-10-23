import { useQuery } from "@tanstack/react-query";
import api from "@/Context/api/api.config";

const EMPTY_SUMMARY = {
  tickets: 0,
  grossCollected: 0,
  refunded: 0,
  netRevenue: 0,
};

// The organizer's orders plus a summary (tickets, paid, refunded, net).
// Pass an event id to narrow both to that event.
export const useTransactions = (eventId = "") =>
  useQuery({
    queryKey: ["adminTransactions", eventId],
    queryFn: async () => {
      const res = await api.get("/api/auth/admin/analytics/transactions", {
        params: eventId ? { eventId } : undefined,
      });
      return {
        transactions: res.data.transactions || [],
        summary: res.data.summary || EMPTY_SUMMARY,
      };
    },
  });

// The organizer's events with their sales figures. Shares its cache key with
// the Event Management page, so opening either one warms the other.
export const useAdminEvents = () =>
  useQuery({
    queryKey: ["adminEvents"],
    queryFn: async () => {
      const res = await api.get("/api/auth/admin/events");
      return res.data?.events || [];
    },
  });

const EMPTY_SALES = {
  event: null,
  totals: EMPTY_SUMMARY,
  byTicketType: [],
  byTelebirr: [],
};

// Tickets sold and money for one event (or all events when no id is given):
// totals plus one row per ticket type.
export const useSales = (eventId = "") =>
  useQuery({
    queryKey: ["adminSales", eventId],
    queryFn: async () => {
      const res = await api.get("/api/auth/admin/analytics/sales", {
        params: eventId ? { eventId } : undefined,
      });
      return {
        event: res.data.event ?? EMPTY_SALES.event,
        totals: res.data.totals ?? EMPTY_SALES.totals,
        byTicketType: res.data.byTicketType ?? EMPTY_SALES.byTicketType,
        byTelebirr: res.data.byTelebirr ?? EMPTY_SALES.byTelebirr,
      };
    },
  });
