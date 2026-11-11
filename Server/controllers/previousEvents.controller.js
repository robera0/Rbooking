import fs from "fs/promises";
import mongoose from "mongoose";
import cloudinary from "../liberary/cloudinaryClient.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { Event } from "../models/events.model.js";
import { OrganizerPost } from "../models/PreviousEvents.model.js";
import catchAsync from "../errors/catchAsync.js";

const getAdminProfile = (userId) =>
  AdminProfile.findOne({ userId }).select("_id");

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true";
};

// POST /api/auth/admin/previous-events
export const createPreviousEventPost = catchAsync(async (req, res) => {
  const profile = await getAdminProfile(req.user.id);
  if (!profile) {
    return res
      .status(403)
      .json({ success: false, message: "Admin profile not found" });
  }

  const { eventId, title, caption, eventDate, thumbnailUrl } = req.body;
  const type =
    req.body.type ||
    (req.file?.mimetype?.startsWith("video/") ? "video" : "photo");

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "A photo or video is required" });
  }

  if (!["photo", "video"].includes(type)) {
    await fs.unlink(req.file.path).catch(() => {});
    return res
      .status(400)
      .json({ success: false, message: "Type must be photo or video" });
  }

  const isVideo = req.file.mimetype?.startsWith("video/");
  const validFile = isVideo
    ? type === "video"
    : type === "photo" && req.file.mimetype?.startsWith("image/");

  if (!validFile) {
    await fs.unlink(req.file.path).catch(() => {});
    return res
      .status(400)
      .json({ success: false, message: `Upload a valid ${type} file` });
  }

  try {
    if (eventId) {
      if (!mongoose.isValidObjectId(eventId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid event ID" });
      }

      const ownedEvent = await Event.findOne({
        _id: eventId,
        adminId: profile._id,
      }).select("_id");

      if (!ownedEvent) {
        return res.status(404).json({
          success: false,
          message: "Event not found for this admin",
        });
      }
    }

    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: "paysso/organizer-posts",
      resource_type: isVideo ? "video" : "image",
    });

    const post = await OrganizerPost.create({
      adminId: profile._id,
      eventId: eventId || null,
      type,
      title: title?.trim() || "",
      caption: caption?.trim() || "",
      mediaUrl: uploaded.secure_url,
      thumbnailUrl: thumbnailUrl?.trim() || "",
      eventDate: eventDate || null,
      isPublished: parseBoolean(req.body.isPublished),
    });

    return res
      .status(201)
      .json({ success: true, message: "Organizer post created", post });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
});

// GET /api/auth/admin/previous-events
export const getAdminPreviousEventPosts = catchAsync(async (req, res) => {
  const profile = await getAdminProfile(req.user.id);
  if (!profile) {
    return res
      .status(403)
      .json({ success: false, message: "Admin profile not found" });
  }

  const filter = { adminId: profile._id };
  if (req.query.eventId) filter.eventId = req.query.eventId;
  if (["photo", "video"].includes(req.query.type)) {
    filter.type = req.query.type;
  }

  const posts = await OrganizerPost.find(filter)
    .populate("eventId", "name dates pictures")
    .sort({ createdAt: -1 });

  return res.json({ success: true, posts });
});

// GET /api/events/:eventId/previous-events
export const getPublishedPreviousEventPosts = catchAsync(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.eventId)) {
    return res.status(400).json({ success: false, message: "Invalid event ID" });
  }

  const posts = await OrganizerPost.find({
    eventId: req.params.eventId,
    isPublished: true,
  })
    .populate("adminId", "organizationName firstName lastName coverPage")
    .sort({ createdAt: -1 });

  return res.json({ success: true, posts });
});

// DELETE /api/auth/admin/previous-events/:postId
export const deleteAdminPreviousEventPost = catchAsync(async (req, res) => {
  const profile = await getAdminProfile(req.user.id);
  if (!profile) {
    return res
      .status(403)
      .json({ success: false, message: "Admin profile not found" });
  }

  const post = await OrganizerPost.findOneAndDelete({
    _id: req.params.postId,
    adminId: profile._id,
  });

  if (!post) {
    return res
      .status(404)
      .json({ success: false, message: "Post not found" });
  }

  return res.json({ success: true, message: "Organizer post deleted" });
});
