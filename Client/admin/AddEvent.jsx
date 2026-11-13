import React, { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useNavigate, useBlocker } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getFriendlyErrorMessage, userMessageError } from "@/lib/errorMessages";
import api from "../src/Context/api/api.config";
import EventForm from "./eventForm/EventForm";
import {
  buildDatesPayload,
  endBeforeStart,
  requiredItems,
  ticketProblems,
} from "@/lib/eventForm";

// Nothing is pre-filled: dates, venue and tickets start empty. The event type
// defaults to a plain event.
const EMPTY_FORM = {
  type: "generic",
  eventName: "",
  artistName: "",
  supportingArtists: [],
  venueName: "",
  city: "",
  address: "",
  description: "",
  startD: "",
  startT: "",
  endD: "",
  endT: "",
  tickets: [],
  policies: [],
  amenities: [],
  existingPictures: [],
  newPictures: [],
  musicGenre: [],
  familyFriendly: false,
  durationDays: "",
  stages: [],
  invitation: false,
  showAvailability: false,
};

const AUTOSAVE_MS = 3000;

const readErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

const shouldCreateFreshDraft = (err, message) =>
  err.response?.status === 404 || /not found/i.test(message || "");

// Keeps the server's own message for a rejected request (4xx), so the toast
// says what is wrong instead of a generic "something went wrong".
const asError = (err, message) => {
  const status = err.response?.status;
  const shown = err.response?.data?.message;
  return shown && status >= 400 && status < 500 && status !== 401 && status !== 403
    ? userMessageError(shown)
    : new Error(message);
};

const buildFormData = (data) => {
  const body = new FormData();
  body.append("type", data.type);
  body.append("name", data.name);
  body.append("links", JSON.stringify(data.links));
  body.append("desc", data.desc);
  body.append("locale", data.locale);
  body.append("artist", JSON.stringify(data.artist));
  body.append("priceRanges", JSON.stringify(data.priceRanges));
  body.append("policies", JSON.stringify(data.policies));
  body.append("dates", JSON.stringify(data.dates));
  body.append("invitation", data.invitation === true);
  body.append("showAvailability", data.showAvailability !== false);
  if (data.status) body.append("status", data.status);
  body.append("amenities", JSON.stringify(data.amenities));
  body.append("musicGenre", JSON.stringify(data.musicGenre));
  if (data.familyFriendly !== undefined) body.append("familyFriendly", data.familyFriendly);
  if (data.durationDays !== undefined) body.append("durationDays", data.durationDays);
  if (data.stages) body.append("stages", JSON.stringify(data.stages));
  (data.pictures || []).forEach((img) => body.append("pictures", img));
  return body;
};

const buildPayload = (form, status) => {
  const type = form.type.toLowerCase();
  const payload = {
    type,
    name: form.eventName.trim(),
    artist: { name: form.artistName },
    locale: "ETH",
    links: {
      self: { href: `/events/${form.eventName.toLowerCase().replace(/\s+/g, "-")}` },
      attractions: [],
      venues: { name: form.venueName.trim(), city: form.city, address: form.address, pictures: [] },
    },
    invitation: form.invitation,
    showAvailability: form.showAvailability,
    policies: form.policies,
    priceRanges: form.tickets.map((t) => ({
      type: t.name,
      currency: "ETB",
      min: Number(t.price),
      max: Number(t.price),
      capacity: Number(t.capacity),
      isActive: t.isActive !== false,
    })),
    pictures: form.newPictures,
    desc: form.description,
    dates: {
      ...buildDatesPayload(form),
      timezone: "Africa/Addis_Ababa",
      status: { code: "onsale" },
    },
    amenities: { activity: form.amenities, payment_method: [], safety: [], other: [] },
    musicGenre: type === "concert" ? form.musicGenre : ["General"],
  };
  if (type === "concert") {
    payload.artist.supporting = form.supportingArtists;
    payload.familyFriendly = form.familyFriendly;
  }
  if (type === "festival") {
    payload.durationDays = Number(form.durationDays) || 0;
    payload.stages = form.stages;
    payload.familyFriendly = form.familyFriendly;
  }
  return { ...payload, status };
};

const AddEvent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // Always the latest form, so the autosave never sends an older version.
  const formRef = useRef(form);
  formRef.current = form;
  const timerRef = useRef(null);
  const draftIdRef = useRef(null);
  // Synchronous guard against double-submitting Publish: state only flips on
  // the next render, so two quick clicks (or a click landing as the autosave
  // fires) could both run and insert every ticket twice.
  const isPublishingRef = useRef(false);
  // The draft save on the wire (so Publish can wait for it) and whether
  // publishing already worked (so no later autosave can touch the event).
  const inFlightSaveRef = useRef(null);
  const publishedRef = useRef(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(EMPTY_FORM);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  useBlocker(({ currentLocation, nextLocation }) => {
    if (dirty && !publishedRef.current && currentLocation.pathname !== nextLocation.pathname) {
      return !window.confirm("You have unsaved changes. Are you sure you want to leave?");
    }
    return false;
  });

  useEffect(() => {
    const onUnload = (e) => {
      if (dirty && !publishedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  const runSaveDraft = async () => {
    const current = formRef.current;
    // The database needs a name and a venue to create an event, even a draft;
    // until both are there there is nothing to save yet.
    if (!current.eventName.trim() || !current.venueName.trim()) return null;
    const payload = buildPayload(current, "draft");
    try {
      if (draftIdRef.current) {
        try {
          const res = await api.patch(`/api/auth/admin/events/${draftIdRef.current}`, buildFormData(payload));
          setSavedAt(new Date());
          return res.data;
        } catch (err) {
          const message = readErrorMessage(err, "Failed to update draft");
          if (shouldCreateFreshDraft(err, message)) draftIdRef.current = null;
          else throw new Error(message);
        }
      }
      const res = await api.post(`/api/auth/admin/addEvents`, buildFormData(payload));
      draftIdRef.current = res.data?.event?._id;
      setSavedAt(new Date());
      return res.data;
    } catch (err) {
      // One toast, replaced rather than stacked, so a problem that blocks
      // every autosave is visible without spamming every few seconds.
      toast.error(`Draft not saved: ${readErrorMessage(err, err.message)}`, { id: "draft-save-error" });
      return null;
    }
  };

  const saveDraft = () => {
    if (isPublishingRef.current || publishedRef.current) return Promise.resolve(null);
    const pending = runSaveDraft().finally(() => {
      if (inFlightSaveRef.current === pending) inFlightSaveRef.current = null;
    });
    inFlightSaveRef.current = pending;
    return pending;
  };

  // Save a few seconds after the organizer stops typing.
  useEffect(() => {
    if (!dirty) return undefined;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveDraft, AUTOSAVE_MS);
    return () => clearTimeout(timerRef.current);
  }, [form]);

  // Saves into the SAME draft id if one exists, only creates when there is none.
  const saveEvent = async (payload) => {
    if (draftIdRef.current) {
      try {
        const res = await api.patch(`/api/auth/admin/events/${draftIdRef.current}`, buildFormData(payload));
        return res.data;
      } catch (err) {
        const message = readErrorMessage(err, "Failed to publish event");
        if (shouldCreateFreshDraft(err, message)) draftIdRef.current = null;
        else throw asError(err, message);
      }
    }
    try {
      const res = await api.post(`/api/auth/admin/addEvents`, buildFormData(payload));
      draftIdRef.current = res.data?.event?._id || res.data?.events?._id || null;
      return res.data;
    } catch (err) {
      throw asError(err, readErrorMessage(err, "Failed to create event"));
    }
  };

  const createTickets = async (eventId, tickets) => {
    try {
      await api.post(`/api/auth/admin/events/${eventId}/tickets`, { tickets });
    } catch (err) {
      throw asError(err, readErrorMessage(err, "Failed to save the tickets"));
    }
  };

  // The tickets are part of publishing: if they fail the organizer must see
  // it and keep the form. Retrying is safe because both calls match existing
  // events/tickets instead of duplicating them.
  const publishMutation = useMutation({
    mutationFn: async (payload) => {
      await Promise.resolve(inFlightSaveRef.current).catch(() => {});
      const data = await saveEvent(payload);
      await createTickets(draftIdRef.current, formRef.current.tickets);
      return data;
    },
    onSuccess: () => {
      publishedRef.current = true;
      toast.success("Event published!", {
        duration: 2000,
        style: { background: "#1C1F22", color: "#fff", border: "1px solid #FF7A00" },
      });
      draftIdRef.current = null;
      setTimeout(() => navigate("/admin/events"), 1500);
    },
    onError: (err) => toast.error(getFriendlyErrorMessage(err)),
  });

  const checklist = requiredItems({
    ...form,
    pictureCount: form.newPictures.length,
    ticketCount: form.tickets.length,
  });

  const publishProblem = () => {
    const missing = checklist.find((c) => !c.ok);
    if (missing) return `Still needed: ${missing.label}`;
    if (endBeforeStart(form)) return "The end must be after the start";
    for (let i = 0; i < form.tickets.length; i += 1) {
      const first = Object.values(
        ticketProblems(form.tickets[i], form.tickets.filter((_, x) => x !== i)),
      )[0];
      if (first) return `Ticket "${form.tickets[i].name}": ${first}`;
    }
    return "";
  };

  const handlePublish = () => {
    if (isPublishingRef.current) return;
    setShowErrors(true);
    const problem = publishProblem();
    if (problem) return toast.error(problem);
    isPublishingRef.current = true;
    // Stop any pending autosave so it can't race the publish.
    clearTimeout(timerRef.current);
    publishMutation.mutate(buildPayload(form, "published"), {
      onSettled: () => {
        isPublishingRef.current = false;
      },
    });
  };

  const busy = publishMutation.isPending;
  const publishBtn = (
    <button
      type="button"
      onClick={handlePublish}
      disabled={busy}
      className="flex items-center justify-center gap-2 rounded-full bg-[#FF7A00] px-7 py-3 text-[13px] font-extrabold text-black transition hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
      {busy ? "Publishing…" : "Publish event"}
    </button>
  );
  const status = savedAt ? (
    <span className="text-[13px] text-[#8b9097]">
      Draft saved {savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
    </span>
  ) : null;

  return (
    <EventForm
      heading="Create event"
      subheading={status || "Saved as a draft while you type"}
      onBack={() => navigate(-1)}
      form={form}
      set={set}
      checklist={checklist}
      showErrors={showErrors}
      actions={publishBtn}
      bottomBar={<div className="flex w-full items-center justify-between gap-3">{status}{publishBtn}</div>}
    />
  );
};

export default AddEvent;
