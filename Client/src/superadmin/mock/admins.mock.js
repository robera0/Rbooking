// src/superadmin/mock/admins.mock.js
// Mock admins + their platform aggregates (revenue, tickets sold, event count).
// Maps to GET /api/superadmin/admins
// IMPORTANT: only services/superadmin.service.js may import this file.

export const ADMINS = [
  {
    id: "adm_1",
    name: "Hana Bekele",
    email: "hana.bekele@rbooking.et",
    phone: "+251911204411",
    avatar: "",
    city: "Addis Ababa",
    eventsCount: 2,
    ticketsSold: 2740,
    revenue: 1962000,
    joinedAt: "2024-03-11T08:00:00.000Z",
  },
  {
    id: "adm_2",
    name: "Dawit Alemu",
    email: "dawit.alemu@rbooking.et",
    phone: "+251912778830",
    avatar: "",
    city: "Addis Ababa",
    eventsCount: 2,
    ticketsSold: 620,
    revenue: 459000,
    joinedAt: "2024-06-02T09:30:00.000Z",
  },
  {
    id: "adm_3",
    name: "Selam Tesfaye",
    email: "selam.tesfaye@rbooking.et",
    phone: "+251913446677",
    avatar: "",
    city: "Bahir Dar",
    eventsCount: 2,
    ticketsSold: 655,
    revenue: 353000,
    joinedAt: "2024-09-19T12:15:00.000Z",
  },
  {
    id: "adm_4",
    name: "Yonas Girma",
    email: "yonas.girma@rbooking.et",
    phone: "+251914990012",
    avatar: "",
    city: "Hawassa",
    eventsCount: 2,
    ticketsSold: 1200,
    revenue: 840000,
    joinedAt: "2025-01-27T07:45:00.000Z",
  },
];

export default ADMINS;
