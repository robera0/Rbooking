import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Save, Upload, Trash2 } from "lucide-react";
import { useNavigate, useParams, useLoaderData, useBlocker } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";
import api from "../src/Context/api/api.config";
import Switch from "@/components/form/Switch";
import EventForm from "./eventForm/EventForm";
import {
  buildDatesPayload,
  datePartsFromEvent,
  endBeforeStart,
  requiredItems,
  ticketProblems,
} from "@/lib/eventForm";

// An event can carry switched-off leftovers with the same name as a live
// ticket (from old autosaves). Showing both would make every save fail with
// "more than one ticket with this name", so hide the inactive copy.
const visibleTickets = (tickets) => {
  if (!Array.isArray(tickets)) return tickets;
  const liveNames = new Set(
    tickets.filter((t) => t.isActive !== false).map((t) => (t.name || "").trim().toLowerCase()),
  );
  return tickets.filter(
    (t) => t.isActive !== false || !liveNames.has((t.name || "").trim().toLowerCase()),
  );
};

const ticketsFromData = (eventData, ev) =>
  visibleTickets(eventData?.tickets)?.map((t) => ({
    // The ticket's real _id, so renaming a tier updates it instead of
    // creating a second document.
    ticketId: t._id,
    name: t.name || "",
    price: String(t.price ?? 0),
    capacity: String(t.totalQuantity ?? 0),
    sold: Math.max(0, (t.totalQuantity || 0) - (t.availableQuantity ?? t.totalQuantity ?? 0)),
    isActive: t.isActive !== false,
  })) ||
  ev.priceRanges?.map((pr) => ({
    name: pr.type || "",
    price: String(pr.min ?? 0),
    capacity: String(pr.capacity || pr.max || 0),
    isActive: pr.isActive !== false,
  })) ||
  [];

const initialForm = (eventData) => {
  const ev = eventData?.event || {};
  return {
    type: ev.type || "generic",
    eventName: ev.name || "",
    artistName: ev.artist?.name || "",
    supportingArtists: ev.artist?.supporting || [],
    venueName: ev.links?.venues?.name || "",
    city: ev.links?.venues?.city || "",
    address: ev.links?.venues?.address || "",
    description: ev.desc || "",
    ...datePartsFromEvent(ev.dates),
    tickets: ticketsFromData(eventData, ev),
    policies: ev.policies || [],
    amenities: ev.amenities?.activity || [],
    existingPictures: ev.pictures || [],
    newPictures: [],
    musicGenre: Array.isArray(ev.musicGenre) ? ev.musicGenre : ev.musicGenre ? [ev.musicGenre] : [],
    familyFriendly: ev.familyFriendly || false,
    durationDays: ev.durationDays ? String(ev.durationDays) : "",
    stages: ev.stages || [],
    invitation: ev.invitation?.enabled || false,
    showAvailability: ev.showAvailability !== false,
    postponed: ev.dates?.status?.code === "postponed",
    dateTbd: ev.dates?.dateTbd === true,
  };
};

const toneBtn = "flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-extrabold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const eventData = useLoaderData();
  const ev = eventData?.event;

  const initialRef = useRef(null);
  const [form, setForm] = useState(() => {
    const f = initialForm(eventData);
    initialRef.current = f;
    return f;
  });
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  // Older events were made without an end time. They may stay that way.
  const legacyNoEnd = useMemo(() => !initialRef.current.endD, []);
  const status = ev?.status;
  const isDraft = status === "draft";
  const isCancelled = status === "cancelled";

  const [isSaved, setIsSaved] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialRef.current),
    [form],
  );

  useBlocker(({ currentLocation, nextLocation }) => {
    if (dirty && !isSaved && currentLocation.pathname !== nextLocation.pathname) {
      return !window.confirm("You have unsaved changes. Are you sure you want to leave?");
    }
    return false;
  });

  React.useEffect(() => {
    const onUnload = (e) => {
      if (dirty && !isSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty, isSaved]);

  const originalStart = ev?.dates?.postponedFrom?.localDate ? ev.dates.postponedFrom : ev?.dates?.start;
  const originalDateLabel = originalStart?.localDate
    ? `${originalStart.localDate}${originalStart.localTime ? ` ${originalStart.localTime.slice(0, 5)}` : ""}`
    : "";

  const dateTbd = form.postponed && form.dateTbd;
  const checklist = requiredItems(
    {
      ...form,
      venueName: form.venueName,
      pictureCount: form.existingPictures.length + form.newPictures.length,
      ticketCount: form.tickets.length,
    },
    { legacyNoEnd, dateTbd },
  );

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const body = new FormData();
      if (payload.status) body.append("status", payload.status);
      body.append("type", payload.type);
      body.append("name", payload.name);
      body.append("locale", payload.locale ?? "");
      body.append("desc", payload.desc ?? "");
      body.append("artist", JSON.stringify(payload.artist));
      body.append("links", JSON.stringify(payload.links));
      body.append("priceRanges", JSON.stringify(payload.priceRanges));
      body.append("policies", JSON.stringify(payload.policies));
      body.append("dates", JSON.stringify(payload.dates));
      body.append("amenities", JSON.stringify(payload.amenities));
      body.append("musicGenre", JSON.stringify(payload.musicGenre));
      body.append("familyFriendly", payload.familyFriendly);
      body.append("invitation", payload.invitation === true);
      body.append("showAvailability", payload.showAvailability !== false);
      body.append("existingPictures", JSON.stringify(payload.existingPictures));
      if (payload.durationDays !== undefined) body.append("durationDays", payload.durationDays);
      if (payload.stages) body.append("stages", JSON.stringify(payload.stages));
      form.newPictures.forEach((img) => body.append("pictures", img));
      const res = await api.put(`/api/admin/events/${eventId}`, body);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Event saved", {
        duration: 2000,
        style: { background: "#1C1F22", color: "#fff", border: "1px solid #FF7A00" },
      });
      queryClient.invalidateQueries(["adminEvents"]);
      queryClient.invalidateQueries(["events"]);
      setIsSaved(true);
      setTimeout(() => navigate("/admin/events"), 1500);
    },
    onError: (err) => toast.error(getFriendlyErrorMessage(err)),
  });

  // Problems that stop any save. What is only needed to publish is checked in
  // the checklist instead.
  const saveProblem = () => {
    if (!form.eventName.trim()) return "Give the event a name";
    if (!form.venueName.trim()) return "Add the venue";
    if (!dateTbd && !(form.startD && form.startT)) return "Pick a start date and time";
    if (endBeforeStart(form)) return "The end must be after the start";
    for (let i = 0; i < form.tickets.length; i += 1) {
      const others = form.tickets.filter((_, x) => x !== i);
      const p = ticketProblems(form.tickets[i], others);
      const first = Object.values(p)[0];
      if (first) return `Ticket "${form.tickets[i].name || i + 1}": ${first}`;
    }
    return "";
  };

  const submit = (publishStatus = null) => {
    setShowErrors(true);
    const problem = saveProblem();
    if (problem) return toast.error(problem);
    if (publishStatus === "published") {
      const missing = checklist.find((c) => !c.ok);
      if (missing) return toast.error(`Still needed: ${missing.label}`);
    }
    const type = form.type.toLowerCase();
    const dates = {
      ...buildDatesPayload(form),
      timezone: "Africa/Addis_Ababa",
      status: { code: "onsale" },
      // The server decides the stored status from this and keeps the original
      // date; a postponed event stays valid for ticket holders.
      postponement: { postponed: form.postponed, dateTbd: form.postponed && form.dateTbd },
    };
    const payload = {
      type,
      name: form.eventName.trim(),
      artist: { name: form.artistName, ...(type === "concert" && { supporting: form.supportingArtists }) },
      locale: form.city,
      desc: form.description,
      existingPictures: form.existingPictures,
      policies: form.policies,
      links: {
        self: { href: `/events/${form.eventName.toLowerCase().replace(/\s+/g, "-")}` },
        attractions: [],
        venues: { name: form.venueName.trim(), city: form.city, address: form.address, pictures: [] },
      },
      priceRanges: form.tickets.map((t) => ({
        ticketId: t.ticketId,
        type: t.name,
        currency: "ETB",
        min: Number(t.price),
        max: Number(t.price),
        capacity: Number(t.capacity),
        isActive: t.isActive !== false,
      })),
      dates,
      amenities: { activity: form.amenities, payment_method: [], safety: [], other: [] },
      musicGenre: type === "concert" ? form.musicGenre : ["General"],
      familyFriendly: form.familyFriendly,
      invitation: form.invitation,
      showAvailability: form.showAvailability,
      ...(type === "festival" && { durationDays: Number(form.durationDays) || 0, stages: form.stages }),
    };
    if (publishStatus) payload.status = publishStatus;
    updateMutation.mutate(payload);
  };

  if (!ev) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-[#FF7A00]" />
        <p className="font-bold text-[#8b9097]">Loading your event…</p>
      </div>
    );
  }

  const busy = updateMutation.isPending;
  const saveBtn = (
    <button type="button" onClick={() => submit()} disabled={busy} className={`${toneBtn} border border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-black`}>
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      {isDraft ? "Save draft" : "Save changes"}
    </button>
  );
  const publishBtn = isDraft && (
    <button type="button" onClick={() => submit("published")} disabled={busy} className={`${toneBtn} bg-[#FF7A00] text-black hover:bg-white`}>
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
      Publish
    </button>
  );

  const sold = form.tickets.reduce((n, t) => n + (t.sold || 0), 0);
  const chip = (
    <span className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[12px] font-bold capitalize">{status === "published" ? "Live" : status}</span>
      {sold > 0 && <span>{sold} tickets sold</span>}
    </span>
  );

  const scheduleExtra = (
    <div className="mt-2 border-t border-white/[0.06] pt-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Date changed? Tell buyers it's postponed</p>
          <p className="text-[12.5px] text-[#8b9097]">Tickets already bought stay valid on the new date.</p>
        </div>
        <Switch label="Postponed" checked={form.postponed} onChange={(v) => set({ postponed: v, dateTbd: v ? form.dateTbd : false })} />
      </div>
      {form.postponed && (
        <div className="mt-3 space-y-3 rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-4">
          {originalDateLabel && <p className="text-[13px] text-[#c9ccd1]">Original date: <b>{originalDateLabel}</b></p>}
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold">New date not decided yet</span>
            <Switch label="New date not decided yet" checked={form.dateTbd} onChange={(v) => set({ dateTbd: v })} />
          </div>
        </div>
      )}
    </div>
  );

  const cancelBlock = !isCancelled && (
    <button type="button" onClick={() => setShowCancelConfirm(true)} disabled={busy} className={`${toneBtn} mt-4 w-full border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white`}>
      <Trash2 size={16} /> Cancel event
    </button>
  );

  return (
    <>
      <EventForm
        heading="Edit event"
        subheading={chip}
        onBack={() => navigate(-1)}
        form={form}
        set={set}
        checklist={checklist}
        showChecklist={isDraft}
        showErrors={showErrors}
        legacyNoEnd={legacyNoEnd}
        allowPast
        dateDisabled={dateTbd}
        scheduleExtra={scheduleExtra}
        actions={<>{saveBtn}{publishBtn}</>}
        sidebarExtra={cancelBlock}
        bottomBar={<>{saveBtn}{publishBtn}</>}
      />
      {showCancelConfirm && createPortal(
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#1C1F22] p-6 text-white">
            <h3 className="mb-2 text-xl font-extrabold">Cancel this event?</h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-300">
              Cancelling stops all ticket sales and notifies ticket holders. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCancelConfirm(false)} disabled={busy} className={`${toneBtn} flex-1 border border-white/10 hover:bg-white/5`}>Keep event</button>
              <button type="button" onClick={() => { setShowCancelConfirm(false); submit("cancelled"); }} disabled={busy} className={`${toneBtn} flex-1 bg-red-500 text-white hover:bg-red-400`}>
                {busy && <Loader2 size={14} className="animate-spin" />} Cancel event
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default EditEvent;
