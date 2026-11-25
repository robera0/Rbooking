import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Plus, X } from "lucide-react";
import { useAdminEvents } from "./api/sales.api";
import {
  useCreateReferral,
  useReferralDetail,
  useReferrals,
  useToggleReferral,
} from "./api/referrals.api";

const money = (n) => `${Number(n || 0).toLocaleString()} Birr`;
const suggest = (name) => {
  const base = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  return base.length >= 3 ? base : "";
};
const linkFor = (referral) =>
  referral.event
    ? `${window.location.origin}/events/${referral.event._id}?ref=${referral.code}`
    : `${window.location.origin}/?ref=${referral.code}`;

const copyLink = async (referral) => {
  try {
    await navigator.clipboard.writeText(linkFor(referral));
    toast.success("Link copied");
  } catch {
    toast.error("Could not copy the link");
  }
};

const Stat = ({ label, value }) => (
  <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
    <p className="text-2xl font-black">{value}</p>
    <p className="text-[11px] uppercase tracking-widest text-gray-500">{label}</p>
  </div>
);

function AddReferral({ onDone }) {
  const { data: events } = useAdminEvents();
  const create = useCreateReferral();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeEdited, setCodeEdited] = useState(false);
  const [eventId, setEventId] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        name,
        code: code || suggest(name),
        eventId: eventId || undefined,
      });
      toast.success("Referral created");
      onDone();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not create the referral");
    }
  };

  const inputClass =
    "w-full bg-white/[0.03] border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-3 outline-none text-sm";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-[#16181b] p-5 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-xs text-gray-500">
          Promoter name
          <input
            className={inputClass}
            value={name}
            maxLength={80}
            placeholder="Abel Tesfaye"
            onChange={(e) => {
              setName(e.target.value);
              if (!codeEdited) setCode(suggest(e.target.value));
            }}
          />
        </label>
        <label className="space-y-1 text-xs text-gray-500">
          Code
          <input
            className={`${inputClass} uppercase tracking-widest`}
            value={code}
            maxLength={20}
            placeholder="ABEL25"
            onChange={(e) => {
              setCodeEdited(true);
              setCode(e.target.value.replace(/[^A-Za-z0-9_-]/g, "").toUpperCase());
            }}
          />
        </label>
      </div>
      <label className="block space-y-1 text-xs text-gray-500">
        Works for
        <select className={inputClass} value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">All my events</option>
          {(events || []).map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={create.isPending || !name.trim()}
          className="rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          {create.isPending ? "Creating..." : "Create"}
        </button>
        <button type="button" onClick={onDone} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ReferralDetail({ id, onClose }) {
  const { data, isPending } = useReferralDetail(id);
  const toggle = useToggleReferral();
  const referral = data?.referral;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#16181b] p-5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">
            {referral?.name || "..."}{" "}
            <span className="ml-2 rounded-lg bg-[#FF7A00]/10 px-2 py-0.5 font-mono text-sm text-[#FF7A00]">
              {referral?.code}
            </span>
          </h2>
          {referral && (
            <div className="mt-1 flex gap-4 text-xs text-gray-500">
              <button onClick={() => copyLink(referral)} className="inline-flex items-center gap-1 hover:text-white">
                <Copy size={12} /> Copy link
              </button>
              <button
                onClick={() => toggle.mutate({ id, isActive: !referral.isActive })}
                className="hover:text-white"
              >
                {referral.isActive ? "Switch off" : "Switch on"}
              </button>
            </div>
          )}
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-full bg-white/5 p-2 hover:bg-white/10">
          <X size={16} />
        </button>
      </div>

      {isPending ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Buyers" value={data.stats.buyers} />
            <Stat label="Tickets" value={data.stats.tickets} />
            <Stat label="Revenue" value={money(data.stats.revenue)} />
          </div>
          {data.byEvent.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">By event</h3>
              {data.byEvent.map((row) => (
                <div key={row.eventId} className="flex justify-between border-b border-white/5 py-2 text-sm">
                  <span>{row.eventName}</span>
                  <span className="text-gray-400">
                    {row.tickets} tickets · {money(row.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Recent sales</h3>
            {data.recentSales.length === 0 ? (
              <p className="text-sm text-gray-500">No paid sales yet.</p>
            ) : (
              data.recentSales.map((sale, i) => (
                <div key={i} className="flex justify-between border-b border-white/5 py-2 text-sm">
                  <span>
                    {sale.buyer} <span className="text-gray-500">· {sale.eventName}</span>
                  </span>
                  <span className="text-gray-400">
                    {sale.quantity} · {new Date(sale.purchasedAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Referrals() {
  const { data: referrals, isPending } = useReferrals();
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState("");

  const totals = useMemo(
    () =>
      (referrals || []).reduce(
        (sum, r) => ({
          tickets: sum.tickets + r.stats.tickets,
          revenue: sum.revenue + r.stats.revenue,
        }),
        { tickets: 0, revenue: 0 },
      ),
    [referrals],
  );

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Referrals</h1>
          <p className="text-sm text-gray-500">
            Give each promoter a code. See who really sells your tickets.
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-bold text-black"
          >
            <Plus size={16} /> Add referral
          </button>
        )}
      </div>

      {adding && <AddReferral onDone={() => setAdding(false)} />}
      {openId && <ReferralDetail id={openId} onClose={() => setOpenId("")} />}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#16181b]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-gray-500">
              <th className="p-4">Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">Buyers</th>
              <th className="p-4">Tickets</th>
              <th className="p-4">Revenue</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {isPending && (
              <tr>
                <td colSpan={6} className="p-4 text-gray-500">Loading...</td>
              </tr>
            )}
            {!isPending && referrals.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No referral codes yet. Add one to start tracking.
                </td>
              </tr>
            )}
            {(referrals || []).map((r) => (
              <tr key={r._id} className={`border-t border-white/5 ${r.isActive ? "" : "opacity-50"}`}>
                <td className="p-4 font-semibold">
                  {r.name}
                  {r.event && <span className="block text-xs font-normal text-gray-500">{r.event.name} only</span>}
                </td>
                <td className="p-4 font-mono text-[#FF7A00]">{r.code}</td>
                <td className="p-4">{r.stats.buyers}</td>
                <td className="p-4">{r.stats.tickets}</td>
                <td className="p-4">{money(r.stats.revenue)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => copyLink(r)} aria-label="Copy link" className="mr-3 text-gray-500 hover:text-white">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => setOpenId(r._id)} className="text-[#FF7A00] hover:underline">
                    {r.isActive ? "View" : "Off · View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {(referrals || []).length > 0 && (
            <tfoot>
              <tr className="border-t border-white/10 text-gray-400">
                <td className="p-4" colSpan={3}>All referrals</td>
                <td className="p-4">{totals.tickets}</td>
                <td className="p-4" colSpan={2}>{money(totals.revenue)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
