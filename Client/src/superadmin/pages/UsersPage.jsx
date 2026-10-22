// src/superadmin/pages/UsersPage.jsx
// Users tab: card grid of every account with search, role chips, a live result
// count and a details drawer.
// Maps to GET /api/superadmin/users (+ GET /api/superadmin/users/:id for the drawer).

import { useEffect, useMemo, useState } from "react";
import { UserRound, UserX } from "lucide-react";
import { getUsers } from "../services/superadmin.service";
import { ROLES, ROLE_LABELS } from "../constants";
import useDebounce from "../hooks/useDebounce";
import SearchBar from "../components/common/SearchBar";
import FilterChips from "../components/common/FilterChips";
import EmptyState from "../components/common/EmptyState";
import UserCard from "../components/users/UserCard";
import UserDetailsDrawer from "../components/users/UserDetailsDrawer";

const SkeletonCard = () => (
  <div className="rounded-[2rem] border border-white/[0.06] bg-[#1C1F22] p-5">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/[0.05]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/[0.05]" />
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-white/[0.04]" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/[0.04]" />
      <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/[0.04]" />
      <div className="h-3 w-2/5 animate-pulse rounded-full bg-white/[0.04]" />
    </div>
    <div className="mt-4 h-12 w-full animate-pulse rounded-2xl bg-white/[0.03]" />
  </div>
);

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await getUsers();
        if (!active) return;
        setUsers(response.users);
      } catch {
        if (active) setError("Could not load users. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const roleChipOptions = useMemo(
    () => [
      { value: "all", label: "All", count: users.length },
      ...Object.values(ROLES).map((role) => ({
        value: role,
        label: ROLE_LABELS[role],
        count: users.filter((user) => user.role === role).length,
      })),
    ],
    [users],
  );

  const filteredUsers = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!needle) return true;

      return [user.fullName, user.phone, user.email]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(needle));
    });
  }, [users, roleFilter, debouncedQuery]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-black uppercase tracking-tighter text-2xl text-white sm:text-3xl">
            Users
          </h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Everyone on the platform
          </p>
        </div>

        <p
          aria-live="polite"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500"
        >
          {loading
            ? "Loading users…"
            : `${filteredUsers.length} of ${users.length} users`}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-5 rounded-[2rem] border border-white/[0.06] bg-[#1C1F22] p-4 sm:p-5">
        <SearchBar
          id="superadmin-users-search"
          value={query}
          onChange={setQuery}
          label="Search users"
          placeholder="Search by name, phone or email…"
        />

        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Role
          </p>
          <FilterChips
            ariaLabel="Filter users by role"
            options={roleChipOptions}
            value={roleFilter}
            onChange={setRoleFilter}
          />
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
          <EmptyState icon={UserX} title="Something went wrong" message={error} />
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredUsers.map((user, index) => (
              <UserCard
                key={user.id}
                user={user}
                index={index}
                onSelect={setSelectedUser}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserRound}
            title="No users match"
            message="Try a different name, phone or email, or reset the role filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setRoleFilter("all");
                }}
                aria-label="Reset all user filters"
                className="rounded-full border border-[#FF7A00]/40 bg-[#FF7A00]/10 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#FF9A3D] transition-colors hover:bg-[#FF7A00]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60"
              >
                Reset filters
              </button>
            }
          />
        )}
      </div>

      <UserDetailsDrawer
        user={selectedUser}
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
