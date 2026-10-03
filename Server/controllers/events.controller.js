import multer from "multer";
import redisClient, { REDIS_PREFIX, safeGet, safeRedis } from "../config/redis.js";
import { TicketModel } from "../models/ticket.model.js";
import { clearEventsCache, clearSingleEventCache } from "../config/redis.js";
import EventService from "../service/event.service.js";
import catchAsync from "../errors/catchAsync.js";
import mongoose from "mongoose";
import path from "path";
import { adminOwnsEvent } from "../utils/adminOwnership.js";
import { safeParse } from "../utils/safeParse.js";
import fs from "fs";
import QRCode from "qrcode";
import { notificationModel } from "../models/notification.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { imageUploader } from "../liberary/index.js";
import "dotenv/config";

const URL = process.env.NODE_ENV === "production"
  ? process.env.CLIENT_URL
  : "http://localhost:5173";
//ADD EVENTS

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    // basename + allow-list so a crafted originalname can't carry path
    // segments or odd characters into the file name on disk.
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, Date.now() + "-" + safeName);
  },
});

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Images only, capped in size: this is also used by the public admin signup
// route, and uploads/ is served statically, so anything else (HTML/SVG) would
// be served back from our own origin.
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPEG, PNG, WebP or GIF images are allowed"));
  },
});

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
    durationDays,
    category,
    familyFriendly,
    capacity,
    status,
  } = req.body;
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const normalizedType = type?.toLowerCase();

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

export const createTickets = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { tickets } = req.body;

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return res.status(400).json({ message: "At least one ticket is required" });
  }
  const invalid = tickets.find(
    (t) =>
      !t?.name ||
      !Number.isFinite(Number(t.price)) ||
      Number(t.price) < 0 ||
      !Number.isInteger(Number(t.capacity)) ||
      Number(t.capacity) <= 0,
  );
  if (invalid) {
    return res.status(400).json({
      message: "Each ticket needs a name, a price of 0 or more, and a whole-number capacity above 0",
    });
  }

  const ownedEvent = await EventService.findById(eventId);
  if (!ownedEvent) return res.status(404).json({ message: "Event not found" });
  if (!(await adminOwnsEvent(req.user.id, ownedEvent))) {
    return res.status(403).json({ message: "You can only add tickets to your own events" });
  }

  const createdNewTickets = await TicketModel.insertMany(
    tickets.map((t) => ({
      eventId,
      name: t.name,
      price: Number(t.price),
      totalQuantity: Number(t.capacity),
      availableQuantity: Number(t.capacity),
      isActive: t.isActive !== false,
    })),
  );

  await clearEventsCache();
  await clearSingleEventCache(eventId);

  res.status(201).json({
    success: true,
    tickets: createdNewTickets,
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
  const allTickets = await TicketModel.find({ eventId: { $in: eventIds }, isActive: { $ne: false } });
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
  await safeRedis(() => redisClient.setex(cacheKey, 300, JSON.stringify(eventsWithTickets)));

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
    .sort({ "dates.start.dateTime": -1 })
    .limit(limit);

  const eventIds = events.map((e) => e._id);

  const allTickets = await TicketModel.find({ eventId: { $in: eventIds }, isActive: { $ne: false } });

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

  await safeRedis(() => redisClient.setex(cacheKey, 3600, JSON.stringify(featuredEvent)));
  res.status(200).json({ events: featuredEvent });
});

export const generateEventQR = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await EventService.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Auto-fetch the first ticket tier for this event
  const firstTicket = await TicketModel.findOne({ eventId, isActive: { $ne: false } }).sort({ _id: 1 });
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
  const { eventId } = req.params;
  // No ticket in the URL (e.g. arriving from the events list) means "show the
  // event with its first in-stock ticket selected".
  const requestedTicketId =
    req.params.ticketId && req.params.ticketId !== "undefined"
      ? req.params.ticketId
      : null;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }
  if (requestedTicketId && !mongoose.Types.ObjectId.isValid(requestedTicketId)) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  const cacheKey = `${REDIS_PREFIX}event:single:${eventId}:${requestedTicketId || "default"}`;

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

  const event = await EventService.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const allTickets = await TicketModel.find({
    eventId,
    isActive: { $ne: false },
  })
    .sort({ _id: 1 })
    .lean();

  const ticketInfo = requestedTicketId
    ? allTickets.find((t) => t._id.toString() === requestedTicketId)
    : allTickets.find((t) => t.availableQuantity > 0) || allTickets[0];

  if (!ticketInfo) {
    return res.status(404).json({ message: "Ticket not found for this event" });
  }

  const payloadToCache = { event, ticket: ticketInfo, tickets: allTickets };
  await safeRedis(() => redisClient.setex(cacheKey, 3600, JSON.stringify(payloadToCache)));

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
  };

  // Remove undefined
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key],
  );

  const existingEvent = await EventService.findById(eventId);
  if (!existingEvent) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  if (!(await adminOwnsEvent(req.user.id, existingEvent))) {
    return res
      .status(403)
      .json({ success: false, message: "You can only edit your own events" });
  }

  const updatedEvent = await EventService.findByIdAndUpdate(
    eventId,
    updateData,
  );

  if (!updatedEvent) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Sync tickets based on updated priceRanges. Each entry carries the real
  // Ticket document's _id (ticketId) when it's an existing tier - matching
  // by _id instead of by name means renaming a tier updates that same
  // document instead of leaving the old-named one behind as an orphaned
  // duplicate while a brand new document gets created for the new name.
  if (priceRanges && Array.isArray(priceRanges)) {
    try {
      const eventIdObj = new mongoose.Types.ObjectId(eventId);

      const existingOps = [];
      const newTickets = [];
      for (const pr of priceRanges) {
        const fields = {
          name: pr.type,
          price: Number(pr.min),
          totalQuantity: Number(pr.capacity) || 0,
          isActive: pr.isActive !== false,
        };
        if (pr.ticketId) {
          existingOps.push({
            updateOne: {
              filter: { _id: pr.ticketId, eventId: eventIdObj },
              update: { $set: fields },
            },
          });
        } else {
          newTickets.push({
            eventId: eventIdObj,
            ...fields,
            availableQuantity: fields.totalQuantity,
          });
        }
      }

      if (existingOps.length > 0) {
        await TicketModel.bulkWrite(existingOps);
      }
      if (newTickets.length > 0) {
        await TicketModel.insertMany(newTickets);
      }

      // Ticket types removed from the form (not just toggled off) are
      // simply absent from priceRanges, so the ops above never touch them -
      // leaving them isActive:true and still purchasable forever.
      // Deactivate anything for this event that's no longer submitted.
      const submittedTicketIds = priceRanges
        .map((pr) => pr.ticketId)
        .filter(Boolean);
      await TicketModel.updateMany(
        { eventId: eventIdObj, _id: { $nin: submittedTicketIds } },
        { $set: { isActive: false } },
      );
    } catch (ticketErr) {
      console.error("Failed to sync tickets:", ticketErr);
    }
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
