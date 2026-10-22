// src/superadmin/mock/scanTickets.mock.js
// Mock scannable tickets used by the gate scanner. Codes are short and typable
// so ManualEntry can be exercised without a camera.
//   RBOOK-0001 .. RBOOK-0008
//   status "valid"   -> first scan returns VALID (then flips to used in-session)
//   status "used"    -> returns ALREADY USED with usedAt
//   status "invalid" -> returns INVALID with a reason (refunded / revoked)
//   any unknown code -> INVALID ("Ticket code not found")
// Maps to POST /api/superadmin/tickets/validate
// IMPORTANT: only services/superadmin.service.js may import this file.

const now = () => Date.now();
const minutesAgo = (m) => new Date(now() - m * 60000).toISOString();

export const SCAN_TICKETS = [
  {
    code: "RBOOK-0001",
    eventId: "evt_1",
    eventName: "Addis Music Festival",
    adminId: "adm_1",
    adminName: "Hana Bekele",
    ticketType: "VIP",
    buyerName: "Meron Haile",
    buyerPhone: "+251911334455",
    amount: 1500,
    status: "valid",
    usedAt: null,
    reason: null,
  },
  {
    code: "RBOOK-0002",
    eventId: "evt_2",
    eventName: "Tech Summit Ethiopia",
    adminId: "adm_2",
    adminName: "Dawit Alemu",
    ticketType: "Regular",
    buyerName: "Kalkidan Desta",
    buyerPhone: "+251955667788",
    amount: 1200,
    status: "valid",
    usedAt: null,
    reason: null,
  },
  {
    code: "RBOOK-0003",
    eventId: "evt_1",
    eventName: "Addis Music Festival",
    adminId: "adm_1",
    adminName: "Hana Bekele",
    ticketType: "Early Bird",
    buyerName: "Sara Mekonnen",
    buyerPhone: "+251933112233",
    amount: 400,
    status: "used",
    usedAt: minutesAgo(25),
    reason: null,
  },
  {
    code: "RBOOK-0004",
    eventId: "evt_3",
    eventName: "Bole Night Run",
    adminId: "adm_1",
    adminName: "Hana Bekele",
    ticketType: "Regular",
    buyerName: "Abel Tesfaye",
    buyerPhone: "+251922778899",
    amount: 350,
    status: "used",
    usedAt: minutesAgo(3),
    reason: null,
  },
  {
    code: "RBOOK-0005",
    eventId: "evt_5",
    eventName: "Hawassa Lakeside Concert",
    adminId: "adm_4",
    adminName: "Yonas Girma",
    ticketType: "Regular",
    buyerName: "Kalkidan Desta",
    buyerPhone: "+251955667788",
    amount: 700,
    status: "valid",
    usedAt: null,
    reason: null,
  },
  {
    code: "RBOOK-0006",
    eventId: "evt_7",
    eventName: "Bahir Dar Food Festival",
    adminId: "adm_3",
    adminName: "Selam Tesfaye",
    ticketType: "VIP",
    buyerName: "Tigist Belete",
    buyerPhone: "+251988990011",
    amount: 800,
    status: "valid",
    usedAt: null,
    reason: null,
  },
  {
    code: "RBOOK-0007",
    eventId: "evt_2",
    eventName: "Tech Summit Ethiopia",
    adminId: "adm_2",
    adminName: "Dawit Alemu",
    ticketType: "VIP",
    buyerName: "Bereket Solomon",
    buyerPhone: "+251966778899",
    amount: 2400,
    status: "used",
    usedAt: minutesAgo(130),
    reason: null,
  },
  {
    code: "RBOOK-0008",
    eventId: "evt_8",
    eventName: "Addis Comedy Gala",
    adminId: "adm_4",
    adminName: "Yonas Girma",
    ticketType: "Regular",
    buyerName: "Nahom Girma",
    buyerPhone: "+251910223344",
    amount: 300,
    status: "invalid",
    usedAt: null,
    reason: "Ticket refunded and revoked",
  },
];

export default SCAN_TICKETS;
