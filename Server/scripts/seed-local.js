// Seeds the LOCAL MongoDB with a demo organizer and a few published events so
// the UI has something to show. It refuses to run against anything that is not
// localhost. Run from the Server folder:  node scripts/seed-local.js
//
// Demo organizer login (local dev only):
//   email:    demo-organizer@paysso.local
//   password: DemoOrganizer#2026
// Demo buyer (a normal user, to see the buyer pages):
//   email:    demo-buyer@paysso.local
//   password: DemoBuyer#2026
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserModel as User } from "../models/user.model.js";
import { AdminProfile } from "../models/adminProfile.model.js";
import { GenericEvent, Concert, Festival } from "../models/events.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { isLocalMongoUrl } from "../service/backfillPaidTo.service.js";

const MONGO_URL =
  process.env.SEED_MONGO_URL || "mongodb://localhost:27017/TimeBooking";

if (process.env.NODE_ENV === "production" || !isLocalMongoUrl(MONGO_URL)) {
  console.error("Refusing to seed: this is not a local development database.");
  process.exit(1);
}

const DEMO_EMAIL = "demo-organizer@paysso.local";
const DEMO_PASSWORD = "DemoOrganizer#2026";
const IMAGE_HOST = process.env.SEED_IMAGE_HOST || "http://localhost:5173";
const DAY = 24 * 60 * 60 * 1000;

const startsIn = (days, hour) => {
  const d = new Date(Date.now() + days * DAY);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
};

const datesFor = (days, hour) => {
  const start = startsIn(days, hour);
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  return {
    start: {
      dateTime: start,
      localDate: start.toISOString().slice(0, 10),
      localTime: `${String(hour + 3).padStart(2, "0")}:00:00`,
    },
    end: { dateTime: end, localDate: end.toISOString().slice(0, 10) },
    timezone: "Africa/Addis_Ababa",
    status: { code: "onsale" },
  };
};

const EVENTS = [
  {
    model: Concert,
    name: "Addis Jazz Night",
    desc: "An evening of live jazz with Ethiopian and international artists, food and drinks included.",
    venue: ["Sheraton Addis Garden", "Addis Ababa", "Taitu St"],
    image: "datebackground.jpg",
    days: 5,
    hour: 16,
    genre: ["Jazz"],
    artist: { name: "Addis Jazz Collective", supporting: ["Selam Quartet"] },
    tickets: [
      ["Regular", 600, 150],
      ["VIP", 1500, 40],
    ],
  },
  {
    model: Festival,
    name: "Fasika Food & Music Fest",
    desc: "Two days of traditional food, coffee ceremonies and live music for the whole family.",
    venue: ["Meskel Square", "Addis Ababa", "Meskel Square"],
    image: "1763661369611.webp",
    days: 12,
    hour: 7,
    stages: ["Main stage", "Coffee garden"],
    tickets: [
      ["General", 350, 500],
      ["Family pass (4)", 1100, 100],
    ],
  },
  {
    model: GenericEvent,
    category: "sports",
    name: "Entoto Trail Run",
    desc: "A 10 km trail run through the Entoto hills. Medal and breakfast for every finisher.",
    venue: ["Entoto Park", "Addis Ababa", "Entoto Rd"],
    image: "Login.jpg",
    days: 9,
    hour: 3,
    tickets: [["Runner entry", 400, 300]],
  },
  {
    model: GenericEvent,
    category: "conference",
    name: "Tech Meetup Addis",
    desc: "Talks and demos from local builders on AI, fintech and mobile money.",
    venue: ["Ethio Telecom Hall", "Addis Ababa", "Churchill Ave"],
    image: "review.JPG",
    days: 3,
    hour: 14,
    tickets: [
      ["Standard", 250, 200],
      ["Student", 0, 50],
    ],
  },
  {
    model: Concert,
    name: "Gospel Praise Concert",
    desc: "A night of worship featuring choirs from across the city.",
    venue: ["Millennium Hall", "Addis Ababa", "Bole Rd"],
    image: "1308183.jpeg",
    days: 18,
    hour: 15,
    genre: ["Gospel"],
    artist: { name: "United Voices Choir", supporting: [] },
    tickets: [
      ["Regular", 300, 400],
      ["Front row", 800, 60],
    ],
  },
  {
    model: GenericEvent,
    category: "exhibition",
    name: "Art in the Park",
    desc: "Open-air exhibition of painters and sculptors, with live demonstrations.",
    venue: ["Unity Park", "Addis Ababa", "Menelik II Ave"],
    image: "photo_2025-11-06_21-23-30.jpg",
    days: 7,
    hour: 8,
    tickets: [["Entry", 150, 600]],
  },
];

await mongoose.connect(MONGO_URL);
console.log("Seeding", mongoose.connection.host, mongoose.connection.name);

let user = await User.findOne({ email: DEMO_EMAIL });
if (!user) {
  user = await User.create({
    email: DEMO_EMAIL,
    password: await bcrypt.hash(DEMO_PASSWORD, 10),
    role: "admin",
    isProfileComplete: true,
  });
}

let admin = await AdminProfile.findOne({ userId: user._id });
if (!admin) {
  admin = await AdminProfile.create({
    userId: user._id,
    firstName: "Demo",
    lastName: "Organizer",
    phone: "0911000000",
    email: DEMO_EMAIL,
    organizationName: "Paysso Demo Events",
    businessType: "Event Organizer",
    country: "Ethiopia",
    city: "Addis Ababa",
    paymentMethods: [
      {
        provider: "Telebirr",
        accountNumber: "0911000000",
        receiverName: "Demo Organizer",
      },
    ],
    isVerified: true,
  });
}

let created = 0;
for (const spec of EVENTS) {
  const exists = await GenericEvent.db.model("Event").findOne({
    name: spec.name,
    adminId: admin._id,
  });
  if (exists) continue;

  const base = {
    adminId: admin._id,
    status: "published",
    name: spec.name,
    desc: spec.desc,
    locale: "en",
    pictures: [`${IMAGE_HOST}/${spec.image}`],
    dates: datesFor(spec.days, spec.hour),
    links: {
      venues: {
        name: spec.venue[0],
        city: spec.venue[1],
        address: spec.venue[2],
      },
    },
    priceRanges: spec.tickets.map(([type, price, capacity]) => ({
      type,
      currency: "ETB",
      min: price,
      max: price,
      capacity,
      isActive: true,
    })),
  };
  if (spec.category) base.category = spec.category;
  if (spec.artist) base.artist = spec.artist;
  if (spec.genre) base.musicGenre = spec.genre;
  if (spec.stages) base.stages = spec.stages;

  const event = await spec.model.create(base);
  await TicketModel.insertMany(
    spec.tickets.map(([name, price, quantity]) => ({
      eventId: event._id,
      name,
      price,
      totalQuantity: quantity,
      availableQuantity: quantity,
      isActive: true,
    })),
  );
  created += 1;
}

console.log(`Created ${created} new event(s).`);

// Demo orders so the sales screens have something to count. Safe to rerun:
// an order is only created when its order number does not exist yet.
const ORDERS = [
  // [event name, ticket type, status, quantity]
  ["Addis Jazz Night", "Regular", "paid", 3],
  ["Addis Jazz Night", "Regular", "paid", 2],
  ["Addis Jazz Night", "VIP", "paid", 4],
  ["Addis Jazz Night", "Regular", "pending", 2],
  ["Addis Jazz Night", "Regular", "refunded", 1],
  ["Entoto Trail Run", "Runner entry", "paid", 100],
  ["Entoto Trail Run", "Runner entry", "paid", 100],
  ["Entoto Trail Run", "Runner entry", "paid", 100],
  ["Tech Meetup Addis", "Standard", "paid", 12],
  ["Tech Meetup Addis", "Student", "paid", 50],
  ["Fasika Food & Music Fest", "General", "paid", 20],
  ["Fasika Food & Music Fest", "Family pass (4)", "paid", 3],
  ["Gospel Praise Concert", "Regular", "paid", 2],
];
const { UserTicketModel } = await import("../models/userTicket.model.js");
let orderSeq = 0;
let ordersCreated = 0;
for (const [eventName, tierName, status, quantity] of ORDERS) {
  orderSeq += 1;
  const orderNo = `SEED-${String(orderSeq).padStart(3, "0")}`;
  if (await UserTicketModel.exists({ orderNo })) continue;
  const event = await GenericEvent.db.model("Event").findOne({ name: eventName, adminId: admin._id });
  const tier = event && (await TicketModel.findOne({ eventId: event._id, name: tierName }));
  if (!tier) continue;
  await UserTicketModel.create({
    userId: user._id,
    ticketId: tier._id,
    orderNo,
    isVerified: status === "paid",
    quantity,
    totalAmount: tier.price * quantity,
    status,
    expiresAt: new Date(Date.now() + DAY),
  });
  if (status === "paid" || status === "pending") {
    await TicketModel.updateOne({ _id: tier._id }, { $inc: { availableQuantity: -quantity } });
  }
  ordersCreated += 1;
}
console.log(`Created ${ordersCreated} new demo order(s).`);

// Two Telebirr numbers for the demo organizer, and a recorded number on some
// of the demo orders. The rest stay unrecorded, like orders paid before the
// number was tracked. Safe to rerun.
const NUMBER_A = { provider: "Telebirr", accountNumber: "0911223344", receiverName: "Selam Tadesse" };
const NUMBER_B = { provider: "Telebirr", accountNumber: "0922556677", receiverName: "Dawit Bekele" };
await AdminProfile.updateOne({ _id: admin._id }, { $set: { paymentMethods: [NUMBER_A, NUMBER_B] } });
const PAID_TO = {
  "SEED-001": NUMBER_A,
  "SEED-002": NUMBER_B,
  "SEED-003": NUMBER_A,
  "SEED-006": NUMBER_A,
  "SEED-007": NUMBER_B,
  "SEED-009": NUMBER_B,
  "SEED-011": NUMBER_A,
};
for (const [orderNo, paidTo] of Object.entries(PAID_TO)) {
  await UserTicketModel.updateOne({ orderNo, paidTo: { $exists: false } }, { $set: { paidTo } });
}
console.log("Telebirr numbers set; demo orders attributed.");

// A normal user who owns the Gospel Praise Concert ticket, so the buyer pages
// (My Tickets, ticket detail) can be seen. Admins are redirected away from
// those pages.
let buyer = await User.findOne({ email: "demo-buyer@paysso.local" });
if (!buyer) {
  buyer = await User.create({
    email: "demo-buyer@paysso.local",
    password: await bcrypt.hash("DemoBuyer#2026", 10),
    role: "user",
    isProfileComplete: true,
  });
}
await UserTicketModel.updateOne({ orderNo: "SEED-013" }, { $set: { userId: buyer._id } });
console.log("Demo buyer ready.");
await mongoose.disconnect();
