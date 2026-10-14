import multer from "multer";
import redisClient, {
  REDIS_PREFIX,
  safeGet,
  safeRedis,
} from "../config/redis.js";
import { TicketModel } from "../models/ticket.model.js";
import { clearEventsCache, clearSingleEventCache } from "../config/redis.js";
import EventService from "../service/event.service.js";
import catchAsync from "../errors/catchAsync.js";
import mongoose from "mongoose";
import { Event } from "../models/events.model.js";
import { resolveStatusUpdate } from "../utils/eventStatus.js";
import { syncEventTickets, TicketSyncError } from "../service/ticketSync.service.js";
import { safeParse } from "../utils/safeParse.js";
import fs from "fs";
import QRCode from "qrcode";
import { notificationModel } from "../models/notification.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { imageUploader } from "../liberary/index.js";
import { getOrCreateInvitation, InvitationError } from "../service/invitation.service.js";
import "dotenv/config";

const URL =
  process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : "http://localhost:5173";
//ADD EVENTS

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

export const addEvent = catchAsync(async (req, res, next) => {
  let {
    type,
    name,
    artist,
    locale,
    policies,
    priceRanges,
    dates,
    sales,
    musicGenre,
    amenities,
    desc,
    links,
    stages,
    invitation,
    durationDays,
    category,
    familyFriendly,
    capacity,
    status,
  } = req.body;
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const normalizedType = type?.toLowerCase();

  // The create page autosaves before an event type is chosen. Say so plainly
  // instead of letting Mongoose fail with a 500 about a missing discriminator.
  if (!normalizedType || !Event.discriminators?.[normalizedType]) {
    return res.status(400).json({
      success: false,
      code: "INVALID_TYPE",
      message: "Choose an event type first",
    });
  }

  artist = safeParse(artist || "{}");
  priceRanges = safeParse(priceRanges || "[]");
  dates = safeParse(dates || "{}");
  amenities = safeParse(amenities || "{}");
  musicGenre = safeParse(musicGenre || "[]");
  policies = safeParse(policies || "[]");
  links = safeParse(links || "{}");
  stages = safeParse(stages || "[]");
  sales = safeParse(sales || "{}");

  if (Array.isArray(category)) {
    category = category[0] || "";
  }

  if (!links.venues) {
    links.venues = {};
  }
  if (!links.venues.name) {
    return res
      .status(400)
      .json({ success: false, message: "Venue name  is required" });
  }

  capacity = Number(capacity) || 0;
  familyFriendly = Boolean(familyFriendly === "true");

  let pictures = [];
  if (req.files && req.files.length > 0) {
    pictures = await imageUploader.uploadMultipleImage(
      req.files.map((file) => file.path),
      "events",
    );
    req.files.forEach((file) => {
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr)
          console.error("Failed to delete temp file:", file.path, unlinkErr);
      });
    });
  }

  let adminProfileId = userId;
  try {
    const adminProfile = await AdminProfile.findOne({ userId });
    if (adminProfile) {
      adminProfileId = adminProfile._id;
    }
  } catch (e) {
    console.error("Failed to find AdminProfile:", e);
  }
  const invitationEnabled = invitation === true || invitation === "true";

  const events = {
    type: normalizedType,
    status,
    adminId: adminProfileId,
    name,
    artist,
    locale: typeof locale === "string" ? locale : "",
    policies,
    priceRanges,
    dates,
    sales,
    musicGenre,
    amenities,
    pictures,
    desc,
    links,
    stages,
    durationDays,
    category,
    familyFriendly,
    invitation: { enabled: invitationEnabled },
  };

  let newEvent;

  try {
    newEvent = await EventService.create(events);
  } catch (err) {
    return next(err);
  }

  await clearEventsCache();

  try {
    await notificationModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          notifications: {
            title: `Created Event: ${name}`,
            message: `You have successfully created the event ${name}.`,
            type: "event",
          },
        },
      },
      { upsert: true, new: true },
    );
  } catch (notifErr) {
    console.error("Failed to create notification for event creation", notifErr);
  }

  res.status(200).json({
    success: true,
    event: newEvent,

    message: "event created successfully",
  });
});

export const createInvitation = catchAsync(async (req, res, next) => {
  try {
    const { invitation, eventName } = await getOrCreateInvitation(
      req.params.eventId,
      req.user.id,
    );

    // generate the QR from the invitation's token
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({
        userTicketId: invitation._id,
        token: invitation.ticketId,
      }),
      {
        width: 600,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      },
    );

    // so getEventById doesn't serve a cache without the invitation
    await clearSingleEventCache(req.params.eventId);

    res.status(201).json({
      success: true,
      invitation: { ...invitation, qrCode },
      eventName,
    });
  } catch (error) {
    if (error instanceof InvitationError) {
      return res
        .status(error.status)
        .json({ success: false, code: error.code, message: error.message });
    }
    throw error;
  }
});

export const createTickets = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { tickets } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  if (!(await EventService.findById(eventId))) {
    return res.status(404).json({ message: "Event not found" });
  }

  try {
    // Matches existing tiers by name, so calling this after a draft was
    // autosaved (or twice) never creates duplicates, and never switches off
    // tiers it was not asked about.
    await syncEventTickets(
      eventId,
      Array.isArray(tickets) ? tickets : [],
      { deactivateMissing: false },
    );
  } catch (error) {
    if (error instanceof TicketSyncError) {
      return res.status(error.status).json({ code: error.code, message: error.message });
    }
    throw error;
  }

  await clearEventsCache();
  await clearSingleEventCache(eventId);

  const saved = await TicketModel.find({ eventId, isActive: { $ne: false } }).lean();
  res.status(201).json({
    success: true,
    tickets: saved,
  });
});

export const getEvents = catchAsync(async (req, res, next) => {
  const { type, artist, date, venues, search } = req.query;
  const cacheKey = `${REDIS_PREFIX}event:list:${JSON.stringify(req.query)}`;
  //hit the cache
  const cachedEvents = await safeGet(cacheKey);
  if (cachedEvents) {
    return res.status(200).json({
      success: true,
      events: JSON.parse(cachedEvents),
      source: "cache",
    });
  }
  // Public listing: only show events the admin actually published. A
  // "draft" event (created but never finished/published, possibly with no
  // ticket types configured yet) was showing up here and appearing as
  // "Sold Out" instead of just not being visible at all.
  const query = { status: "published" };

  if (type) {
    query.type = {
      $regex: type,
      $options: "i",
    };
  }

  if (artist) {
    query["artist.name"] = {
      $regex: artist,
      $options: "i",
    };
  }

  if (venues) {
    query["links.venues.name"] = {
      $regex: venues,
      $options: "i",
    };
  }

  if (date) {
    query["dates.start.localDate"] = date;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { "artist.name": { $regex: search, $options: "i" } },
      { "links.venues.name": { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
    ];
  }
  const events = await EventService.find(query).sort({
    createdAt: -1,
  });

  const eventIds = events.map((e) => e._id);
  const allTickets = await TicketModel.find({
    eventId: { $in: eventIds },
    isActive: { $ne: false },
  });
  // Group Tickets for an event
  const ticketsByEvent = allTickets.reduce((acc, ticket) => {
    const key = ticket?.eventId?.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(ticket);
    return acc;
  }, {});

  const eventsWithTickets = events.map((event) => {
    const tickets = ticketsByEvent[event._id.toString()] || [];

    return { ...event, tickets, ticketCount: tickets.length };
  });
  await safeRedis(() =>
    redisClient.setex(cacheKey, 300, JSON.stringify(eventsWithTickets)),
  );

  res.status(200).json({
    success: true,
    events: eventsWithTickets,
  });
});
// FETCH EVENTS

export const featuredEvents = catchAsync(async (req, res, next) => {
  const limit = 4;
  const cacheKey = `${REDIS_PREFIX}events:featured`;
  const cachedEvent = await safeGet(cacheKey);
  if (cachedEvent) {
    return res.status(200).json({
      success: true,
      events: JSON.parse(cachedEvent),
      source: "cache",
    });
  }
  console.log("Fetching from database...");
  const events = await EventService.find({ status: "published" })
    .sort({ "date.start.dateTime": -1 })
    .limit(limit);

  const eventIds = events.map((e) => e._id);

  const allTickets = await TicketModel.find({
    eventId: { $in: eventIds },
    isActive: { $ne: false },
  });

  const ticketsByEvent = allTickets.reduce((acc, ticket) => {
    const key = ticket?.eventId?.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(ticket);
    return acc;
  }, {});
  const featuredEvent = events?.map((event) => {
    const tickets = ticketsByEvent[event._id.toString()] || [];
    return {
      ...event,
      tickets: tickets,
      ticketCount: tickets.length,
    };
  });

  await safeRedis(() =>
    redisClient.setex(cacheKey, 3600, JSON.stringify(featuredEvent)),
  );
  res.status(200).json({ events: featuredEvent });
});

export const generateEventQR = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await EventService.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Auto-fetch the first ticket tier for this event
  const firstTicket = await TicketModel.findOne({
    eventId,
    isActive: { $ne: false },
  }).sort({ _id: 1 });
  if (!firstTicket) {
    return res.status(404).json({ message: "No tickets found for this event" });
  }

  const url = `${URL}/events/${eventId}/tickets/${firstTicket._id}`;
  const qrCode = await QRCode.toDataURL(url, {
    width: 600,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return res.status(200).json({
    success: true,
    qrCode,
    eventName: event.name,
    url,
  });
});

// FETCH WITH RESPECT TO ITS INDEX\

export const fetchEventsId = catchAsync(async (req, res, next) => {
  const { eventId, ticketId } = req.params;

  //
  const cacheKey = `${REDIS_PREFIX}event:single:${eventId}:${ticketId}`;

  const cachedCombo = await safeGet(cacheKey);
  if (cachedCombo) {
    const decoded = JSON.parse(cachedCombo);
    return res.status(200).json({
      success: true,
      event: decoded.event,
      ticket: decoded.ticket,
      tickets: decoded.tickets,
      source: "cache",
    });
  }

  if (!ticketId || ticketId === "undefined") {
    return res.status(400).json({ message: "Ticket ID is required" });
  }

  const event = await EventService.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const ticketInfo = await TicketModel.findOne({
    _id: ticketId,
    eventId,
    isActive: { $ne: false },
  });
  if (!ticketInfo) {
    return res.status(404).json({ message: "Ticket not found for this event" });
  }

  const allTickets = await TicketModel.find({
    eventId,
    isActive: { $ne: false },
  }).lean();

  const payloadToCache = { event, ticket: ticketInfo, tickets: allTickets };
  await safeRedis(() =>
    redisClient.setex(cacheKey, 3600, JSON.stringify(payloadToCache)),
  );

  res.status(200).json({
    success: true,
    event,
    ticket: ticketInfo,
    tickets: allTickets,
  });
});

export const getEventById = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const cacheKey = `${REDIS_PREFIX}event:single:${eventId}`;
  const cachedPayload = await safeGet(cacheKey);
  if (cachedPayload) {
    const parsed = JSON.parse(cachedPayload);
    // Guard against a stale cache entry from before this endpoint started
    // wrapping the response as {event, tickets} (it used to cache the bare
    // event object) - treat that shape as a miss rather than returning
    // undefined event/tickets for up to an hour after deploy.
    if (parsed && parsed.event) {
      return res
        .status(200)
        .json({ success: true, event: parsed.event, tickets: parsed.tickets });
    }
  }
  const event = await EventService.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  // The real Ticket documents (with stable _id), not just the priceRanges
  // snapshot embedded on the event - the admin edit form needs the _id to
  // update a ticket tier by identity instead of by name (see updateEvent),
  // otherwise renaming a tier orphans the old document instead of
  // updating it.
  const tickets = await TicketModel.find({ eventId }).lean();
  await safeRedis(() =>
    redisClient.setex(cacheKey, 3600, JSON.stringify({ event, tickets })),
  );
  res.status(200).json({ success: true, event, tickets });
});
//update event

export const updateEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  console.log(eventId);
  let {
    type,
    status,
    name,
    artist,
    locale,
    info,
    policies,
    priceRanges,
    dates,
    sales,
    musicGenre,
    amenities,
    desc,
    links,
    existingPictures,

    classifications,
    // festival fields
    stages,
    durationDays,

    // event fields
    category,
    invitation,

    // common
    familyFriendly,
  } = req.body;

  const normalizedType = type?.toLowerCase();

  // Parse JSON fields
  if (artist) artist = safeParse(artist);
  if (priceRanges) priceRanges = safeParse(priceRanges);
  if (dates) dates = safeParse(dates);
  if (amenities) amenities = safeParse(amenities);
  if (musicGenre) musicGenre = safeParse(musicGenre);
  if (policies) policies = safeParse(policies);
  if (existingPictures) existingPictures = safeParse(existingPictures);
  if (links) links = safeParse(links);
  if (stages) stages = safeParse(stages);

  if (classifications) classifications = safeParse(classifications);
  if (sales) sales = safeParse(sales);
  if (existingPictures) existingPictures = safeParse(existingPictures);
  // Handle images
  let pictures = existingPictures || [];
  if (req.files && req.files.length > 0) {
    const newPictures = await imageUploader.uploadMultipleImage(
      req.files.map((file) => file.path),
      "events",
    );
    pictures = [...pictures, ...newPictures];
    req.files.forEach((file) => {
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr)
          console.error("Failed to delete temp file:", file.path, unlinkErr);
      });
    });
  }

  const updateData = {
    type: normalizedType,
    status: status,
    name,
    artist,
    locale,
    info,
    policies,
    priceRanges,
    dates,
    sales,
    musicGenre,
    amenities,
    pictures,
    desc,
    links,

    stages,
    durationDays,

    category,

    familyFriendly,
    invitation:
      invitation === undefined
        ? undefined
        : { enabled: invitation === true || invitation === "true" },
  };

  // Remove undefined
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key],
  );

  const existingEvent = await EventService.findById(eventId);
  if (!existingEvent) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // A late draft autosave must not unpublish an event that was just published.
  updateData.status = resolveStatusUpdate(existingEvent.status, updateData.status);
  if (updateData.status === undefined) delete updateData.status;

  // Tickets first: a bad submission (negative price, capacity below what is
  // already sold, ...) is rejected before anything about the event changes.
  if (Array.isArray(priceRanges)) {
    try {
      await syncEventTickets(
        eventId,
        priceRanges.map((pr) => ({
          ticketId: pr.ticketId,
          name: pr.type ?? pr.name,
          price: pr.min ?? pr.price,
          capacity: pr.capacity,
          isActive: pr.isActive,
        })),
      );
    } catch (error) {
      if (error instanceof TicketSyncError) {
        return res.status(error.status).json({
          success: false,
          code: error.code,
          message: error.message,
        });
      }
      throw error;
    }
  }

  let updatedEvent;
  try {
    updatedEvent = await EventService.findByIdAndUpdate(eventId, updateData);
  } finally {
    // Tickets may already have changed above. If saving the event itself
    // fails, readers must still not be served the old cached tickets.
    await clearEventsCache();
    await clearSingleEventCache(eventId);
  }

  if (!updatedEvent) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  await clearEventsCache();
  await clearSingleEventCache(eventId);

  try {
    const userId = req.user?.id;
    if (userId) {
      await notificationModel.findOneAndUpdate(
        { userId },
        {
          $push: {
            notifications: {
              title: `Updated Event: ${name || updatedEvent.name}`,
              message: `You have successfully updated the event ${name || updatedEvent.name}.`,
              type: "event",
            },
          },
        },
        { upsert: true, new: true },
      );
    }
  } catch (notifErr) {
    console.error("Failed to create notification for event update", notifErr);
  }

  res.status(200).json({
    success: true,
    event: updatedEvent,
    message: "Event updated successfully",
  });
});
