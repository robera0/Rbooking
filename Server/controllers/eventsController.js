import { Event } from "../models/EventsModel.js";
import { TicketModel } from "../models/TicketModel.js";
import multer from "multer";
import redisClient from "../config/redis.js";
import { clearEventsCache, clearSingleEventCache } from "../config/redis.js";

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
export const add_event = async (req, res) => {
  try {
    let {
      type,
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
    } = req.body;

    const normalizedType = type?.toLowerCase();

    // Parse JSON fields
    artist = JSON.parse(artist || "{}");
    priceRanges = JSON.parse(priceRanges || "[]");
    dates = JSON.parse(dates || "{}");
    amenities = JSON.parse(amenities || "{}");
    musicGenre = JSON.parse(musicGenre || "[]");
    policies = JSON.parse(policies || "[]");

    // Handle multiple images
    let pictures = [];

    if (req.files && req.files.length > 0) {
      pictures = req.files.map((file) => `uploads/${file.filename}`);
    }

    const events = {
      type: normalizedType,
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
    };

    const newEvent = await Event.create(events);
    await clearEventsCache();
    res.status(200).json({
      success: true,
      event: newEvent,
      message: "event created successfully",
    });
  } catch (error) {
    console.error("Error adding events:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const get_events = async (req, res) => {
  try {
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
    const events = await Event.find(query).sort({
      "date.start.localDate": -1,
    });

    // Get tickets for each event
    const eventsWithTickets = await Promise.all(
      events?.map(async (event) => {
        const tickets = await TicketModel.find({
          eventId: event._id,
        });

        return {
          ...event.toObject(),
          tickets: tickets,
          ticketCount: tickets.length,
        };
      }),
    );
    await redisClient.setex(cacheKey, 300, JSON.stringify(eventsWithTickets));

    res.status(200).json({
      success: true,
      events: eventsWithTickets,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// FETCH EVENTS

export const featured_events = async (req, res) => {
  try {
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
    const events = await Event.find().sort({ "date.start": -1 }).limit(limit);
    const featuredEvents = await Promise.all(
      events?.map(async (event) => {
        const tickets = await TicketModel.find({
          eventId: event._id,
        });
        return {
          ...event.toObject(),
          tickets: tickets,
          ticketCount: tickets.length,
        };
      }),
    );
    await redisClient.setex(cacheKey, 3600, JSON.stringify(featuredEvents));
    res.status(200).json({ events: featuredEvents });
  } catch {
    res.status(401).json({ message: "No Filtered Events" });
  }
};

// FETCH WITH RESPECT TO ITS INDEX
export const fetchEvents_id = async (req, res) => {
  try {
    const { eventId, ticketId } = req.params;
    const cacheKey = `event:single:${eventId}`;
    const cachedCombo = await redisClient.get(cacheKey);
    if (cachedCombo) {
      const decoded = JSON.parse(cachedCombo);
      return res.status(200).json({
        success: true,
        event: decoded.event,
        ticket: decoded.ticket,
        source: "cache",
      });
    }
    if (!ticketId || ticketId === "undefined") {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    // FIXED: Correct populate path for your nested schema
    const event = await Event.findById(eventId).populate({
      path: "comments", // This is the array of Comment documents in Event
      populate: [
        {
          path: "user", // The user who created the comment document
          model: "User",
          select: "fullName avatarUrl",
        },
        {
          path: "comment.userId", // Nested path for individual comments
          model: "userprofiles",
          select: "fullName avatarUrl",
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const ticketInfo = await TicketModel.findOne({
      _id: ticketId,
      eventId: eventId,
    });

    if (!ticketInfo) {
      return res
        .status(404)
        .json({ message: "Ticket not found for this event" });
    }
    const payloadToCache = { event, ticket: ticketInfo };
    await redisClient.setex(cacheKey, 3600, JSON.stringify(payloadToCache));
    res.status(200).json({
      event: event,
      ticket: ticketInfo,
    });
  } catch (error) {
    console.error("ERROR in fetchevents_id:", error);
    res.status(500).json({ message: error.message });
  }
};

export const get_event_by_id = async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `event:single:${eventId}`;
    const cachedEvent = await redisClient.get(cacheKey);
    if (cachedEvent) {
      return res
        .status(200)
        .json({ success: true, event: JSON.parse(cachedEvent) });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    await redisClient.setex(cacheKey, 3600, JSON.stringify(event));
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update_event = async (req, res) => {
  try {
    const { eventId } = req.params;
    let {
      type,
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
      existingPictures,
    } = req.body;

    const normalizedType = type?.toLowerCase();

    // Parse JSON fields
    if (artist) artist = JSON.parse(artist);
    if (priceRanges) priceRanges = JSON.parse(priceRanges);
    if (dates) dates = JSON.parse(dates);
    if (amenities) amenities = JSON.parse(amenities);
    if (musicGenre) musicGenre = JSON.parse(musicGenre);
    if (policies) policies = JSON.parse(policies);
    if (existingPictures) existingPictures = JSON.parse(existingPictures);

    // Handle images
    let pictures = existingPictures || [];
    if (req.files && req.files.length > 0) {
      const newPictures = req.files.map((file) => `uploads/${file.filename}`);
      pictures = [...pictures, ...newPictures];
    }

    const updateData = {
      type: normalizedType,
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
    };

    // Remove undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    await clearEventsCache();
    await clearSingleEventCache(eventId);
    res.status(200).json({
      success: true,
      event: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
