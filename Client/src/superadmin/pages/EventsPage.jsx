// src/superadmin/pages/EventsPage.jsx

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CalendarX2 } from "lucide-react";
import { getAdmins, getEvents } from "../services/superadmin.service";
import { STATUS_LABELS, STATUS_ORDER } from "../constants";
import useDebounce from "../hooks/useDebounce";
import SearchBar from "../components/common/SearchBar";
import FilterChips from "../components/common/FilterChips";
import EmptyState from "../components/common/EmptyState";
import EventCard from "../components/events/EventCard";

/* Loading skeleton that mirrors the EventCard layout. */
const SkeletonCard = () => (
  <div className="overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#1C1F22]">
    <div className="h-44 w-full animate-pulse bg-white/[0.04]" />
    <div className="space-y-3 p-5">
      <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.05]" />
      <div className="h-5 w-4/5 animate-pulse rounded-full bg-white/[0.05]" />
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/[0.04]" />
      <div className="h-10 w-full animate-pulse rounded-2xl bg-white/[0.03]" />
      <div className="h-1.5 w-full animate-pulse rounded-full bg-white/[0.05]" />
    </div>
  </div>
);

/* Normalize IDs because MongoDB references may be objects or strings. */
const normalizeId = (value) => {
  if (value == null) return "";

  if (typeof value === "object") {
    return String(value._id ?? value.id ?? "");
  }

  return String(value);
};

/* Get the admin's display name. */
const getAdminName = (admin) => {
  const fullName = [admin?.firstName, admin?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    admin?.organizationName ||
    admin?.name ||
    fullName ||
    admin?.userId?.email ||
    admin?.email ||
    "Unnamed admin"
  );
};

/*
 * Match an event against either the admin profile ID or its user ID.
 * This supports events that reference either document.
 */
const eventBelongsToAdmin = (event, admin) => {
  const eventAdminId = normalizeId(event.adminId);

  if (!eventAdminId) return false;

  const profileId = normalizeId(admin._id ?? admin.id);
  const userId = normalizeId(admin.userId);

  return (
    eventAdminId === profileId || (userId !== "" && eventAdminId === userId)
  );
};

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [query, setQuery] = useState("");
  const [adminFilter, setAdminFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [eventsResponse, adminsResponse] = await Promise.all([
          getEvents(),
          getAdmins(),
        ]);

        if (!active) return;

        setEvents(
          Array.isArray(eventsResponse?.events) ? eventsResponse.events : [],
        );

        // The admins endpoint now returns { success: true, admins: [...] }.
        setAdmins(
          Array.isArray(adminsResponse?.admins) ? adminsResponse.admins : [],
        );
      } catch (err) {
        console.error("Failed to load superadmin events:", err);

        if (active) {
          setError("Could not load events. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const adminChipOptions = useMemo(
    () => [
      { value: "all", label: "All", count: events.length },
      ...admins.map((admin) => {
        const adminId = normalizeId(admin._id ?? admin.id);

        return {
          value: adminId,
          label: getAdminName(admin),
          count: events.filter((event) => eventBelongsToAdmin(event, admin))
            .length,
        };
      }),
    ],
    [admins, events],
  );

  const statusChipOptions = useMemo(
    () => [
      { value: "all", label: "All", count: events.length },
      ...STATUS_ORDER.map((status) => ({
        value: status,
        label: STATUS_LABELS[status],
        count: events.filter((event) => event.status === status).length,
      })),
    ],
    [events],
  );

  const filteredEvents = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    return events.filter((event) => {
      const eventAdminId = normalizeId(event.adminId);

      if (adminFilter !== "all") {
        const selectedAdmin = admins.find(
          (admin) => normalizeId(admin._id ?? admin.id) === adminFilter,
        );

        if (!selectedAdmin || !eventBelongsToAdmin(event, selectedAdmin)) {
          return false;
        }
      }

      if (statusFilter !== "all" && event.status !== statusFilter) {
        return false;
      }

      if (!needle) return true;

      const matchedAdmin = admins.find((admin) => {
        const profileId = normalizeId(admin._id ?? admin.id);
        const userId = normalizeId(admin.userId);

        return (
          eventAdminId === profileId ||
          (userId !== "" && eventAdminId === userId)
        );
      });

      const eventAdmin =
        typeof event.adminId === "object" ? event.adminId : null;

      const venueName = event.links?.venues?.name || "";
      const venueCity = event.links?.venues?.city || "";

      const searchableValues = [
        event.name,
        venueName,
        venueCity,
        event.type,
        getAdminName(matchedAdmin),
        matchedAdmin?.email,
        matchedAdmin?.userId?.email,
        eventAdmin?.organizationName,
        eventAdmin?.email,
        eventAdmin?.userId?.email,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(needle),
      );
    });
  }, [events, admins, adminFilter, statusFilter, debouncedQuery]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-black uppercase tracking-tighter text-2xl text-white sm:text-3xl">
            Events
          </h2>

          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Every event from every admin
          </p>
        </div>

        <p
          aria-live="polite"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500"
        >
          {loading
            ? "Loading events…"
            : `${filteredEvents.length} of ${events.length} events`}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-5 rounded-[2rem] border border-white/[0.06] bg-[#1C1F22] p-4 sm:p-5">
        <SearchBar
          id="superadmin-events-search"
          value={query}
          onChange={setQuery}
          label="Search events"
          placeholder="Search by event, venue, city or admin…"
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              Admin
            </p>

            <FilterChips
              ariaLabel="Filter events by admin"
              options={adminChipOptions}
              value={adminFilter}
              onChange={setAdminFilter}
            />
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              Status
            </p>

            <FilterChips
              ariaLabel="Filter events by status"
              options={statusChipOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={CalendarX2}
            title="Something went wrong"
            message={error}
          />
        ) : filteredEvents.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredEvents.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No events match"
            message="Try a different search term, or reset the admin and status filters."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setAdminFilter("all");
                  setStatusFilter("all");
                }}
                aria-label="Reset all event filters"
                className="rounded-full border border-[#FF7A00]/40 bg-[#FF7A00]/10 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#FF9A3D] transition-colors hover:bg-[#FF7A00]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
              >
                Reset filters
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
