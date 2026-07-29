import multer from "multer";
import redisClient from "../config/redis.js";
import { TicketModel } from "../models/ticket.model.js";
import { clearEventsCache, clearSingleEventCache } from "../config/redis.js";
import EventService from "../service/event.service.js";
import catchAsync from "../errors/catchAsync.js";
import mongoose from "mongoose";
import { safeParse } from "../utils/safeParse.js";
import fs from "fs";
import QRCode from "qrcode";
import "dotenv/config";

const URL = process.env.VITE_API_URL;
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
    pictures = req.files.map((file) => `uploads/${file.filename}`);
  }

  const events = {
    type: normalizedType,
    status,
    adminId: userId,
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
    // Cleanup uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr)
            console.error("Failed to delete file:", file.path, unlinkErr);
        });
      });
    }
    return next(err);
  }

  await clearEventsCache();
  res
    .status(200)
    .json({
      success: true,
      event: newEvent,
      message: "event created successfully",
    });
});

export const createTickets = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { tickets } = req.body;

  const createdNewTickets = await TicketModel.insertMany(
    tickets.map((t) => ({
      eventId,
      name: t.name,
      price: Number(t.price),
      totalQuantity: Number(t.capacity),
      availableQuantity: Number(t.capacity),
    })),
  );

  res.status(201).json({
    success: true,
    tickets: createdNewTickets,
  });
});

export const getEvents = catchAsync(async (req, res, next) => {
  const { type, artist, date, venues, search } = req.query;
  const cacheKey = `event:list:${JSON.stringify(req.query)}`;
  //hit the cache
  const cachedEvents = await redisClient.get(cacheKey);
  if (cachedEvents) {
    return res.status(200).json({
      success: true,
      events: JSON.parse(cachedEvents),
      source: "cache",
    });
  }
  const query = {};

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
    "date.start.localDate": -1,
  });

  const eventIds = events.map((e) => e._id);
  const allTickets = await TicketModel.find({ eventId: { $in: eventIds } });
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
  await redisClient.setex(cacheKey, 300, JSON.stringify(eventsWithTickets));

  res.status(200).json({
    success: true,
    events: eventsWithTickets,
  });
});
// FETCH EVENTS

export const featuredEvents = catchAsync(async (req, res, next) => {
  const limit = 4;
  const cacheKey = "events:featured";
  const cachedEvent = await redisClient.get(cacheKey);
  if (cachedEvent) {
    return res.status(200).json({
      success: true,
      events: JSON.parse(cachedEvent),
      source: "cache",
    });
  }
  console.log("Fetching from database...");
  const events = await EventService.find()
    .sort({ "date.start.dateTime": -1 })
    .limit(limit);

  const eventIds = events.map((e) => e._id);

  const allTickets = await TicketModel.find({ eventId: { $in: eventIds } });

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

  await redisClient.setex(cacheKey, 3600, JSON.stringify(featuredEvents));
  res.status(200).json({ events: featuredEvent });
});

export const generateEventQR = catchAsync(async (req, res, next) => {
  const { eventId, ticketId } = req.params;
  const url = `${URL}/events/${eventId}/tickets/${ticketId}`;
  if (!ticketId || ticketId === "null") {
    return res.status(400).json({ message: "Ticket ID is required" });
  }

  const event = await EventService.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const qrCode = await QRCode.toDataURL(url);

  return res.status(200).json({
    success: true,
    qrCode,
  });
});

// FETCH WITH RESPECT TO ITS INDEX\

export const fetchEventsId = catchAsync(async (req, res, next) => {
  const { eventId, ticketId } = req.params;

  //
  const cacheKey = `event:single:${eventId}:${ticketId}`;

  const cachedCombo = await redisClient.get(cacheKey);
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

  const ticketInfo = await TicketModel.findOne({ _id: ticketId, eventId });
  if (!ticketInfo) {
    return res.status(404).json({ message: "Ticket not found for this event" });
  }

  const allTickets = await TicketModel.find({ eventId }).lean();

  const payloadToCache = { event, ticket: ticketInfo, tickets: allTickets };
  await redisClient.setex(cacheKey, 3600, JSON.stringify(payloadToCache));

  res.status(200).json({
    success: true,
    event,
    ticket: ticketInfo,
    tickets: allTickets,
  });
});

export const getEventById = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const cacheKey = `event:single:${eventId}`;
  const cachedEvent = await redisClient.get(cacheKey);
  if (cachedEvent) {
    return res
      .status(200)
      .json({ success: true, event: JSON.parse(cachedEvent) });
  }
  const event = await EventService.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  await redisClient.setex(cacheKey, 3600, JSON.stringify(event));
  res.status(200).json({ success: true, event });
});

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
    const newPictures = req.files.map((file) => `uploads/${file.filename}`);
    pictures = [...pictures, ...newPictures];
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

  const updatedEvent = await EventService.findByIdAndUpdate(
    eventId,
    updateData,
  );

  if (!updatedEvent) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  await clearEventsCache();
  await clearSingleEventCache(eventId);
  res.status(200).json({
    success: true,
    event: updatedEvent,
    message: "Event updated successfully",
  });
});
