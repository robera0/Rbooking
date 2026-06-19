import mongoose from "mongoose";

// Price range
export const PriceRangeSchema = new mongoose.Schema(
  {
    type: String,
    currency: String,
    min: Number,
    max: Number,
    activeFrom: Date,
    activeUntil: Date,
    isActive: Boolean,
  },
  { _id: false },
);

// Dates
export const DatesSchema = new mongoose.Schema(
  {
    start: {
      localDate: String, // "2024-08-15"
      localTime: String, // "20:00:00"
      dateTime: Date, // UTC (BEST for queries)
    },
    end: {
      localDate: String,
      localTime: String,
      dateTime: Date,
    },
    timezone: String,
    status: {
      code: String, // onsale, cancelled, postponed,upcoming
    },
    access: {
      startDateTime: Date,
    },
  },
  { _id: false },
);

// Classification
export const ClassificationSchema = new mongoose.Schema(
  {
    primary: Boolean,
    segment: {
      name: String, // Music, Festival, Sports
    },
    genre: {
      name: String, // Rock, Cultural, etc.
    },
    subGenre: {
      name: String,
    },
    family: Boolean,
  },
  { _id: false },
);
// RATING SCHEMA

const RatingSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    outOf: {
      type: Number,
      default: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

// AMENITY SCHEMA

const AmenitySchema = new mongoose.Schema(
  {
    activity: [{ type: String }],
    payment_method: [{ type: String }],
    safety: [{ type: String }],
    other: [{ type: String }],
  },
  { _id: false },
);

//  BASE EVENT SCHEMA

const BaseEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["generic", "concert", "festival"],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminProfile",
      required: true,
    },
    name: String,
    desc: String,
    url: String,
    locale: String,
    pictures: [String],
    info: String,
    policies: [
      {
        header: String,
        descriptions: String,
      },
    ],
    priceRanges: [PriceRangeSchema],
    dates: DatesSchema,
    classifications: [ClassificationSchema],
    sales: {
      public: {
        startDateTime: Date,
        endDateTime: Date,
      },
      presales: [
        {
          name: String,
          startDateTime: Date,
          endDateTime: Date,
        },
      ],
    },
    links: {
      self: {
        href: String, // current event ,we gone fetch the related event with link instead of hard coding it
      },
      attractions: [{ href: String }], // related artist
      venues: {
        name: {
          type: String,
          required: true,
        },
        city: String,
        address: String,
        pictures: [String],
      },
    },
    rating: RatingSchema,
    amenities: AmenitySchema,
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },

  {
    discriminatorKey: "type",
    timestamps: true,
  },
);

export const Event = mongoose.model("Event", BaseEventSchema);

// CONCERT SCHEMA

const ConcertSchema = new mongoose.Schema({
  artist: {
    name: String,
  },

  musicGenre: [String],
  familyFriendly: {
    type: Boolean,
    default: false,
  },
});

export const Concert = Event.discriminator("concert", ConcertSchema);

//  FESTIVAL SCHEMA

const FestivalSchema = new mongoose.Schema({
  durationDays: Number,
  stages: [String],
  familyFriendly: Boolean,
});

export const Festival = Event.discriminator("festival", FestivalSchema);

// GENERIC EVENT SCHEMA

const GenericEventSchema = new mongoose.Schema({
  category: String, // sports, conference, expo, etc.
});

export const GenericEvent = Event.discriminator("generic", GenericEventSchema);
