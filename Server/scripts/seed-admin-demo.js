// Seeds a small, obviously-fake dataset for the admin console.
//   node scripts/seed-admin-demo.js
// Uses LOCAL_MONGO (or SEED_MONGO_URL). Refuses non-local databases unless
// --yes is passed, exactly like seed-super-admin.js.
import "dotenv/config";
import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { Event } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { UserTicketModel } from "../models/userTicket.model.js";
import { Payout } from "../models/payout.model.js";
import { ScanLog } from "../models/scanLog.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import { hashPasswords } from "../service/password.js";

const url = process.env.SEED_MONGO_URL || process.env.LOCAL_MONGO;
if (!url) {
  console.error("Set LOCAL_MONGO or SEED_MONGO_URL.");
  process.exit(1);
}
const isLocal = /^mongodb:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url);
if (!isLocal && !process.argv.includes("--yes")) {
  console.error("That is not a local database. Re-run with --yes to seed it anyway.");
  process.exit(1);
}

const ADMIN_EMAIL = "admin@paysso.et";
const ADMIN_PASSWORD = "Admin12345!";

await mongoose.connect(url, { serverSelectionTimeoutMS: 8000 });

const password = await hashPasswords(ADMIN_PASSWORD);

const admin = await UserModel.findOneAndUpdate(
  { email: ADMIN_EMAIL },
  {
    $set: {
      email: ADMIN_EMAIL,
      password,
      role: "super_admin",
      status: "active",
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const organizerUser = await UserModel.findOneAndUpdate(
  { email: "organizer@paysso.et" },
  {
    $set: {
      password: await hashPasswords("Organizer123!"),
      role: "admin",
      status: "active",
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const organizer = await AdminProfile.findOneAndUpdate(
  { userId: organizerUser._id },
  {
    $set: {
      firstName: "Hanna",
      lastName: "Tesfaye",
      email: "organizer@paysso.et",
      phone: "+251911000111",
      organizationName: "Addis Live Events",
      businessType: "Event Organizer",
      country: "Ethiopia",
      city: "Addis Ababa",
      region: "Bole",
      streetAddress: "Bole Road",
      isVerified: false,
      commissionRate: null,
      paymentMethods: [
        {
          provider: "Telebirr",
          accountNumber: "0911000111",
          receiverName: "Hanna",
        },
      ],
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const buyer = await UserModel.findOneAndUpdate(
  { email: "buyer@paysso.et" },
  {
    $set: {
      password: await hashPasswords("Buyer123!"),
      role: "user",
      status: "active",
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);
await ProfileModel.findOneAndUpdate(
  { userId: buyer._id },
  {
    $set: {
      fullName: "Dawit Bekele",
      phone: "+251922333444",
      address: "Addis Ababa",
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

await UserModel.findOneAndUpdate(
  { email: "second.buyer@paysso.et" },
  {
    $set: {
      password: await hashPasswords("Buyer123!"),
      role: "user",
      status: "active",
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const event = await Event.findOneAndUpdate(
  { name: "Phase 1 Demo Night", adminId: organizer._id },
  {
    $set: {
      type: "generic",
      status: "published",
      name: "Phase 1 Demo Night",
      desc: "A seeded event for the admin console.",
      adminId: organizer._id,
      dates: {
        start: {
          dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          timezone: "Africa/Addis_Ababa",
        },
        timezone: "Africa/Addis_Ababa",
      },
      links: {
        venues: {
          name: "Millennium Hall",
          city: "Addis Ababa",
          address: "Bole",
        },
      },
      pictures: [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
      ],
      isFeatured: true,
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const draft = await Event.findOneAndUpdate(
  { name: "Phase 1 Demo Draft", adminId: organizer._id },
  {
    $set: {
      type: "generic",
      status: "draft",
      name: "Phase 1 Demo Draft",
      desc: "An unfinished event.",
      adminId: organizer._id,
      dates: { timezone: "Africa/Addis_Ababa" },
      links: { venues: { name: "TBA", city: "Addis Ababa" } },
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const vip = await TicketModel.findOneAndUpdate(
  { eventId: event._id, name: "VIP" },
  {
    $set: {
      price: 1500,
      totalQuantity: 100,
      availableQuantity: 96,
      isActive: true,
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);
await TicketModel.findOneAndUpdate(
  { eventId: event._id, name: "Regular" },
  {
    $set: {
      price: 500,
      totalQuantity: 300,
      availableQuantity: 299,
      isActive: true,
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

await UserTicketModel.findOneAndUpdate(
  { orderNo: "ORD-DEMO-PAID" },
  {
    $set: {
      userId: buyer._id,
      ticketId: vip._id,
      ticketType: "VIP",
      isVerified: true,
      quantity: 2,
      totalAmount: 3000,
      status: "paid",
      purchasedAt: new Date(),
      commissionRate: 0.1,
      commissionAmount: 300,
      checked: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: admin._id,
      },
    },
    $unset: {
      refundedAt: "",
      refundedBy: "",
      refundAmount: "",
      refundReason: "",
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

await UserTicketModel.findOneAndUpdate(
  { orderNo: "ORD-DEMO-PENDING" },
  {
    $set: {
      userId: buyer._id,
      ticketId: vip._id,
      ticketType: "VIP",
      isVerified: false,
      quantity: 1,
      totalAmount: 1500,
      status: "pending",
      expiresAt: new Date(Date.now() + 25 * 60 * 1000),
      purchasedAt: new Date(),
      checked: {
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
      },
    },
    $unset: {
      refundedAt: "",
      refundedBy: "",
      refundAmount: "",
      refundReason: "",
      commissionRate: "",
      commissionAmount: "",
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

await UserTicketModel.findOneAndUpdate(
  { orderNo: "ORD-DEMO-REFUND" },
  {
    $set: {
      userId: buyer._id,
      ticketId: vip._id,
      ticketType: "VIP",
      isVerified: true,
      quantity: 1,
      totalAmount: 1500,
      status: "refunded",
      refundAmount: 1500,
      refundedAt: new Date(),
      refundedBy: admin._id,
      purchasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      checked: {
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
      },
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

await Payout.findOneAndUpdate(
  { organizerId: organizer._id, note: "Seed demo payout" },
  {
    $set: {
      amount: 500,
      method: "Telebirr",
      reference: "DEMO-PAYOUT-1",
      status: "paid",
      paidAt: new Date(),
      createdBy: admin._id,
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

await ScanLog.findOneAndUpdate(
  { orderNo: "ORD-DEMO-PAID", result: "checked_in" },
  {
    $set: {
      eventId: event._id,
      eventName: event.name,
      buyerName: "Dawit Bekele",
      tierName: "VIP",
      scannerId: admin._id,
      scannerEmail: ADMIN_EMAIL,
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

await AuditLog.findOneAndUpdate(
  { action: "ticket.scan", entityId: "ORD-DEMO-PAID" },
  {
    $set: {
      actorId: admin._id,
      actorEmail: ADMIN_EMAIL,
      actorRole: "super_admin",
      entityType: "order",
      message: "Checked in: ORD-DEMO-PAID · Phase 1 Demo Night",
    },
  },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

console.log(`Seeded admin console demo data in ${mongoose.connection.name}`);
console.log(`Super admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
console.log(`Organizer: organizer@paysso.et / Organizer123!`);
console.log(`Buyer: buyer@paysso.et / Buyer123!`);
console.log(`Events: ${event.name}, ${draft.name}`);
await mongoose.disconnect();
