import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  QrCode,
  Loader2,
  ImagePlus,
  RotateCcw,
  Share2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../src/Context/api/api.config";
import toast from "react-hot-toast";
import JSZip from "jszip";

// Poster size used for the downloaded PNG (4:5).
const POSTER_W = 1080;
const POSTER_H = 1350;
const LINE_HEIGHT = 1.2;
const MAX_LINES = 2;

const PRESET_BGS = [
  { id: "sunset", colors: ["#FF7A00", "#7a1f00"] },
  { id: "midnight", colors: ["#1e1b4b", "#0f172a"] },
  { id: "emerald", colors: ["#059669", "#022c22"] },
  { id: "rose", colors: ["#e11d48", "#4c0519"] },
  { id: "mono", colors: ["#3f3f46", "#09090b"] },
];

const FONTS = [
  { label: "Sans", value: "sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Rounded", value: "'Trebuchet MS', sans-serif" },
  { label: "Mono", value: "'Courier New', monospace" },
  { label: "Impact", value: "Impact, 'Arial Black', sans-serif" },
];

const WEIGHTS = [
  { label: "Regular", value: 400 },
  { label: "Medium", value: 600 },
  { label: "Bold", value: 700 },
  { label: "Extra bold", value: 800 },
  { label: "Black", value: 900 },
];

// x / y are the CENTER of each element, in % of the poster.
// size / padding / radius are in poster pixels (1080 x 1350 canvas).
const DEFAULT_LAYOUT = {
  overlay: 0.35,
  label: {
    visible: true,
    text: "EVENT",
    x: 50,
    y: 8.1,
    size: 26,
    color: "#ffffff",
    opacity: 0.75,
    weight: 800,
    font: "sans-serif",
    tracking: 0.15,
    maxWidth: 86,
  },
  eventName: {
    visible: true,
    x: 50,
    y: 13.7,
    size: 56,
    color: "#ffffff",
    opacity: 1,
    weight: 800,
    font: "sans-serif",
    tracking: 0,
    maxWidth: 86,
  },
  qr: {
    visible: true,
    x: 50,
    y: 47.4,
    size: 380,
    padding: 30,
    bg: "#ffffff",
    radius: 40,
  },
  caption: {
    visible: true,
    text: "INVITATION PASS",
    x: 50,
    y: 67.4,
    size: 28,
    color: "#ffffff",
    opacity: 0.85,
    weight: 700,
    font: "sans-serif",
    tracking: 0.15,
    maxWidth: 86,
  },
  guest: {
    visible: true,
    x: 50,
    y: 73.3,
    size: 44,
    color: "#ffffff",
    opacity: 1,
    weight: 800,
    font: "sans-serif",
    tracking: 0,
    maxWidth: 86,
  },
};

const TEXT_KEYS = ["label", "eventName", "caption", "guest"];

const LAYER_LABELS = {
  label: "Label",
  eventName: "Event name",
  qr: "QR code",
  caption: "Caption",
  guest: "Guest name",
};

const mergeLayout = (saved) => {
  const out = { overlay: DEFAULT_LAYOUT.overlay };

  if (typeof saved?.overlay === "number") out.overlay = saved.overlay;

  Object.keys(LAYER_LABELS).forEach((key) => {
    out[key] = { ...DEFAULT_LAYOUT[key], ...(saved?.[key] || {}) };
  });

  return out;
};

const EMPTY_GUEST = { guestName: "", email: "", phone: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round1 = (v) => Math.round(v * 10) / 10;

// Poster pixels -> container-query width units for the live preview.
const cqw = (px) => `${(px / POSTER_W) * 100}cqw`;

const gradientCss = (colors) =>
  `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const drawCover = (ctx, img, w, h) => {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
};

const fillRoundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);

  ctx.beginPath();

  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  ctx.fill();
};

const fitText = (ctx, text, maxWidth) => {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let t = text;

  while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) {
    t = t.slice(0, -1);
  }

  return t + "…";
};

// Word-wraps text into at most `maxLines` lines; the last line gets an ellipsis.
const wrapLines = (ctx, text, maxWidth, maxLines = MAX_LINES) => {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return [];

  const lines = [];
  let line = "";

  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;

    if (!line || ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  });

  lines.push(line);

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines - 1);
    kept.push(fitText(ctx, lines.slice(maxLines - 1).join(" "), maxWidth));
    return kept;
  }

  return lines.map((l) => fitText(ctx, l, maxWidth));
};

const drawText = (ctx, t, text) => {
  if (!t.visible || !text) return;

  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = t.opacity;
  ctx.fillStyle = t.color;
  ctx.font = `${t.weight} ${t.size}px ${t.font}`;

  if ("letterSpacing" in ctx) {
    ctx.letterSpacing = `${t.tracking * t.size}px`;
  }

  const maxWidth = (t.maxWidth / 100) * POSTER_W;
  const lines = wrapLines(ctx, text, maxWidth);
  const lineHeight = t.size * LINE_HEIGHT;
  const cx = (t.x / 100) * POSTER_W;
  const cy = (t.y / 100) * POSTER_H;
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((l, i) => {
    ctx.fillText(l, cx, startY + i * lineHeight);
  });

  ctx.restore();
};

const inputClass =
  "w-full bg-[#0a0b0c] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-[#FF7A00]/50 outline-none transition-colors";

const smallLabel =
  "block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5";

const Slider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}) => (
  <label className="block">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
      <span>{label}</span>
      <span className="text-gray-500">
        {value}
        {suffix}
      </span>
    </div>

    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#FF7A00]"
    />
  </label>
);

const ColorField = ({ label, value, onChange }) => (
  <label className="block">
    <span className={smallLabel}>{label}</span>

    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
      />

      <span className="font-mono text-[11px] text-gray-500">{value}</span>
    </div>
  </label>
);

const InvitationQR = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const layoutStorageKey = `invitation-layout:${eventId}`;

  const [busy, setBusy] = useState(false);
  const [bg, setBg] = useState({
    type: "preset",
    id: PRESET_BGS[0].id,
  });
  const [guest, setGuest] = useState(EMPTY_GUEST);
  const [errors, setErrors] = useState({});
  const [generated, setGenerated] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Admin-customisable poster layout (saved per event in this browser).
  const [layout, setLayout] = useState(() => {
    try {
      const raw = localStorage.getItem(layoutStorageKey);
      return mergeLayout(raw ? JSON.parse(raw) : null);
    } catch {
      return mergeLayout(null);
    }
  });
  const [selected, setSelected] = useState("eventName");

  const fileInputRef = useRef(null);
  const touchStartX = useRef(null);
  const posterRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(layoutStorageKey, JSON.stringify(layout));
    } catch {
      // Storage can be unavailable; the layout just won't persist.
    }
  }, [layout, layoutStorageKey]);

  const updateLayer = (key, patch) =>
    setLayout((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const resetLayout = () => {
    setLayout(mergeLayout(null));
    toast.success("Layout reset");
  };

  const createMutation = useMutation({
    mutationFn: async (body) => {
      const res = await api.post(
        `/api/auth/admin/events/${eventId}/invitation`,
        body,
      );

      const { invitations, invitation, eventName } = res.data;

      // Supports both array and single-invitation backend responses.
      const tickets = invitations || (invitation ? [invitation] : []);

      if (!tickets.length) {
        throw new Error("The server did not return any invitations");
      }

      return tickets.map((ticket) => ({
        qrCode: ticket.qrCode,
        eventName: eventName || "",
        ticketId: ticket.ticketId,
        guestName: ticket.guestName || "",
      }));
    },

    onSuccess: (data) => {
      setGenerated(data);
      setActiveIndex(0);
      toast.success(`${data.length} invitation(s) generated`);
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not create the invitations",
      );
    },
  });

  const activePreset =
    bg.type === "preset"
      ? PRESET_BGS.find((p) => p.id === bg.id) || PRESET_BGS[0]
      : null;

  const currentInvitation = generated[activeIndex] || null;
  const formLocked = generated.length > 0;

  const setField = (field, value) => {
    setGuest((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    const name = guest.guestName.trim();
    const email = guest.email.trim();
    const phone = guest.phone.replace(/[\s-]/g, "");

    if (!name) next.guestName = "Guest name is required";
    if (email && !EMAIL_RE.test(email)) next.email = "Enter a valid email";
    if (phone && !PHONE_RE.test(phone))
      next.phone = "Enter a valid phone number";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = () => {
    if (createMutation.isPending || !validate()) return;

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 20
    ) {
      toast.error("Generate between 1 and 20 invitations");
      return;
    }

    createMutation.mutate({
      guestName: guest.guestName.trim(),
      email: guest.email.trim(),
      phone: guest.phone.replace(/[\s-]/g, ""),
      quantity: parsedQuantity,
    });
  };

  const handleNewGuest = () => {
    setGenerated([]);
    setActiveIndex(0);
    setGuest(EMPTY_GUEST);
    setQuantity(1);
    setErrors({});
  };

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setBg({ type: "image", src: reader.result });
    };

    reader.onerror = () => {
      toast.error("Could not read that image");
    };

    reader.readAsDataURL(file);
  };

  // ---- Drag to position -------------------------------------------------
  const dragProps = (key) => ({
    onPointerDown: (e) => {
      if (!posterRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      setSelected(key);
      dragRef.current = {
        key,
        rect: posterRef.current.getBoundingClientRect(),
      };

      e.currentTarget.setPointerCapture?.(e.pointerId);
    },

    onPointerMove: (e) => {
      const drag = dragRef.current;

      if (!drag || drag.key !== key) return;

      const x = ((e.clientX - drag.rect.left) / drag.rect.width) * 100;
      const y = ((e.clientY - drag.rect.top) / drag.rect.height) * 100;

      updateLayer(key, {
        x: round1(clamp(x, 0, 100)),
        y: round1(clamp(y, 0, 100)),
      });
    },

    onPointerUp: () => {
      dragRef.current = null;
    },

    onPointerCancel: () => {
      dragRef.current = null;
    },

    // Keep the poster's swipe-to-change-slide from firing while dragging.
    onTouchStart: (e) => e.stopPropagation(),
    onTouchEnd: (e) => e.stopPropagation(),
  });

  const dragStyle = (key) => ({
    cursor: "grab",
    touchAction: "none",
    outline: selected === key ? "2px dashed #FF7A00" : "none",
    outlineOffset: 3,
  });

  // ---- Poster rendering (download / share) -------------------------------
  const buildPosterBlob = async (invitation = currentInvitation) => {
    if (!invitation) {
      throw new Error("No invitation selected");
    }

    const canvas = document.createElement("canvas");
    canvas.width = POSTER_W;
    canvas.height = POSTER_H;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not create the poster canvas");
    }

    // 1. Background
    if (bg.type === "image") {
      drawCover(ctx, await loadImage(bg.src), POSTER_W, POSTER_H);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, POSTER_W, POSTER_H);

      gradient.addColorStop(0, activePreset.colors[0]);
      gradient.addColorStop(1, activePreset.colors[1]);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, POSTER_W, POSTER_H);
    }

    // 2. Dark overlay
    ctx.fillStyle = `rgba(0,0,0,${layout.overlay})`;
    ctx.fillRect(0, 0, POSTER_W, POSTER_H);

    // 3. Text layers
    drawText(ctx, layout.label, layout.label.text);
    drawText(ctx, layout.eventName, invitation.eventName || "");
    drawText(ctx, layout.caption, layout.caption.text);
    drawText(ctx, layout.guest, invitation.guestName || "");

    // 4. QR tile
    const q = layout.qr;

    if (q.visible) {
      const tileX = (q.x / 100) * POSTER_W - q.size / 2;
      const tileY = (q.y / 100) * POSTER_H - q.size / 2;

      ctx.fillStyle = q.bg;
      fillRoundRect(ctx, tileX, tileY, q.size, q.size, q.radius);

      const qrImg = await loadImage(invitation.qrCode);

      ctx.drawImage(
        qrImg,
        tileX + q.padding,
        tileY + q.padding,
        q.size - q.padding * 2,
        q.size - q.padding * 2,
      );
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not create the PNG"));
        }
      }, "image/png");
    });
  };

  const posterFileName = (invitation = currentInvitation) => {
    const safe = (value) =>
      (value || "")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);

    return `Invitation-${safe(invitation?.eventName) || "event"}-${
      safe(invitation?.guestName) || invitation?.ticketId?.slice(-6) || "ticket"
    }.png`;
  };

  const handleDownload = async () => {
    if (!currentInvitation || busy) return;

    setBusy(true);

    try {
      const blob = await buildPosterBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = posterFileName();

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Delay revocation so the browser can start the download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success("Invitation downloaded");
    } catch (err) {
      console.error("QR download error:", err);
      toast.error("Failed to download the invitation");
    } finally {
      setBusy(false);
    }
  };

  // Builds every generated pass and saves them together as one zip.
  const handleDownloadAll = async () => {
    if (!generated.length || busy) return;

    setBusy(true);

    try {
      const zip = new JSZip();

      for (let i = 0; i < generated.length; i += 1) {
        const blob = await buildPosterBlob(generated[i]);
        const name = posterFileName(generated[i]).replace(
          /\.png$/,
          `-${i + 1}.png`,
        );
        zip.file(name, blob);
      }

      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");

      link.href = url;
      const eventSlug = (generated[0].eventName || "event")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
      link.download = `Invitations-${eventSlug || "event"}.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success(`${generated.length} invitations downloaded`);
    } catch (err) {
      console.error("QR bulk download error:", err);
      toast.error("Failed to download the invitations");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    if (!currentInvitation || busy) return;

    setBusy(true);

    try {
      const blob = await buildPosterBlob();
      const file = new File([blob], posterFileName(), {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: currentInvitation.eventName || "Invitation",
        });
      } else {
        toast.error("Sharing is not supported here. Use Download instead.");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Share error:", err);
        toast.error("Failed to share the invitation");
      }
    } finally {
      setBusy(false);
    }
  };

  const goToSlide = (index) => {
    if (index < 0 || index >= generated.length) return;
    setActiveIndex(index);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;

    const difference = touchStartX.current - e.changedTouches[0].clientX;

    if (difference > 50) {
      goToSlide(activeIndex + 1);
    } else if (difference < -50) {
      goToSlide(activeIndex - 1);
    }

    touchStartX.current = null;
  };

  const posterBgStyle =
    bg.type === "image"
      ? {
          backgroundImage: `url(${bg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          backgroundImage: gradientCss(activePreset.colors),
        };

  const textContent = {
    label: layout.label.text,
    eventName: currentInvitation?.eventName || "Your event name",
    caption: layout.caption.text,
    guest: currentInvitation?.guestName || guest.guestName || "Guest name",
  };

  const sel = layout[selected];
  const selIsText = TEXT_KEYS.includes(selected);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="relative z-10 px-2 pt-2 pb-24">
        {/* Back navigation */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280] hover:text-[#f4f4f5] transition-colors mb-10 group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Events
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center">
                <QrCode size={18} className="text-[#FF7A00]" />
              </div>

              <div>
                <h1 className="text-[20px] font-bold text-[#f4f4f5]">
                  Invitation QR Codes
                </h1>

                <p className="text-[12px] text-[#6b7280]">
                  Generate invitations and download each pass
                </p>
              </div>
            </div>
          </div>

          {/* Side-by-side: controls on the left, live poster on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-6 items-start">
            {/* LEFT: controls */}
            <div className="order-2 lg:order-1 min-w-0">
              {/* Guest form */}
              <div className="rounded-3xl bg-[#111214] border border-[#1f2023] p-4 sm:p-6 mb-6 space-y-4">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Guest Details
                </p>

                <div>
                  <input
                    className={`${inputClass} ${
                      errors.guestName ? "border-red-500/50" : ""
                    }`}
                    placeholder="Guest name *"
                    value={guest.guestName}
                    onChange={(e) => setField("guestName", e.target.value)}
                    disabled={formLocked}
                  />
                  {errors.guestName && (
                    <p className="text-red-500 font-bold text-[10px] mt-1.5">
                      {errors.guestName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="email"
                      className={`${inputClass} ${
                        errors.email ? "border-red-500/50" : ""
                      }`}
                      placeholder="Email (optional)"
                      value={guest.email}
                      onChange={(e) => setField("email", e.target.value)}
                      disabled={formLocked}
                    />

                    {errors.email && (
                      <p className="text-red-500 font-bold text-[10px] mt-1.5">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      className={`${inputClass} ${
                        errors.phone ? "border-red-500/50" : ""
                      }`}
                      placeholder="Phone number (optional)"
                      value={guest.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      disabled={formLocked}
                    />

                    {errors.phone && (
                      <p className="text-red-500 font-bold text-[10px] mt-1.5">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Number of invitations (1–20)
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    className={inputClass}
                    value={quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      setQuantity(value === "" ? "" : Number(value));
                    }}
                    disabled={formLocked}
                  />
                </div>

                <p className="font-bold text-[10px] text-gray-600">
                  Name is required. Email and phone are optional.
                </p>
              </div>

              {/* Generate button */}
              {!formLocked && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={createMutation.isPending}
                  className="w-full mb-6 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-black bg-[#FF7A00] hover:bg-[#ff8f1f] transition-colors shadow-lg shadow-[#FF7A00]/10 disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <QrCode size={16} strokeWidth={2.5} />
                  )}

                  {createMutation.isPending
                    ? "Generating Invitations..."
                    : "Generate Invitations"}
                </motion.button>
              )}

              {/* Customize panel */}
              <div className="rounded-3xl bg-[#111214] border border-[#1f2023] p-4 sm:p-6 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    Customize
                  </p>

                  <button
                    type="button"
                    onClick={resetLayout}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                  >
                    <RotateCcw size={12} />
                    Reset layout
                  </button>
                </div>

                {/* Element picker */}
                <div className="flex flex-wrap gap-2">
                  {Object.keys(LAYER_LABELS).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelected(key)}
                      aria-pressed={selected === key}
                      className={`px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors ${
                        selected === key
                          ? "border-[#FF7A00] text-[#FF7A00] bg-[#FF7A00]/10"
                          : "border-white/10 text-gray-400 hover:border-[#FF7A00]/60"
                      } ${layout[key].visible ? "" : "opacity-50"}`}
                    >
                      {LAYER_LABELS[key]}
                    </button>
                  ))}
                </div>

                {/* Controls for the selected element */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={sel.visible}
                      onChange={(e) =>
                        updateLayer(selected, { visible: e.target.checked })
                      }
                      className="accent-[#FF7A00] h-4 w-4"
                    />
                    Show {LAYER_LABELS[selected].toLowerCase()}
                  </label>

                  {(selected === "label" || selected === "caption") && (
                    <div>
                      <span className={smallLabel}>Text</span>
                      <input
                        className={inputClass}
                        value={sel.text}
                        onChange={(e) =>
                          updateLayer(selected, { text: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {selIsText && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                          <span className={smallLabel}>Font</span>
                          <select
                            className={inputClass}
                            value={sel.font}
                            onChange={(e) =>
                              updateLayer(selected, { font: e.target.value })
                            }
                          >
                            {FONTS.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className={smallLabel}>Weight</span>
                          <select
                            className={inputClass}
                            value={sel.weight}
                            onChange={(e) =>
                              updateLayer(selected, {
                                weight: Number(e.target.value),
                              })
                            }
                          >
                            {WEIGHTS.map((w) => (
                              <option key={w.value} value={w.value}>
                                {w.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <ColorField
                        label="Text colour"
                        value={sel.color}
                        onChange={(color) => updateLayer(selected, { color })}
                      />

                      <Slider
                        label="Font size"
                        value={sel.size}
                        min={12}
                        max={140}
                        onChange={(size) => updateLayer(selected, { size })}
                        suffix="px"
                      />

                      <Slider
                        label="Opacity"
                        value={sel.opacity}
                        min={0.1}
                        max={1}
                        step={0.05}
                        onChange={(opacity) =>
                          updateLayer(selected, { opacity })
                        }
                      />

                      <Slider
                        label="Letter spacing"
                        value={sel.tracking}
                        min={0}
                        max={0.4}
                        step={0.01}
                        onChange={(tracking) =>
                          updateLayer(selected, { tracking })
                        }
                        suffix="em"
                      />

                      <Slider
                        label="Text box width"
                        value={sel.maxWidth}
                        min={20}
                        max={100}
                        onChange={(maxWidth) =>
                          updateLayer(selected, { maxWidth })
                        }
                        suffix="%"
                      />
                    </>
                  )}

                  {selected === "qr" && (
                    <>
                      <Slider
                        label="QR size"
                        value={sel.size}
                        min={160}
                        max={800}
                        onChange={(size) => updateLayer("qr", { size })}
                        suffix="px"
                      />

                      <Slider
                        label="Inner padding"
                        value={sel.padding}
                        min={0}
                        max={80}
                        onChange={(padding) => updateLayer("qr", { padding })}
                        suffix="px"
                      />

                      <Slider
                        label="Corner radius"
                        value={sel.radius}
                        min={0}
                        max={200}
                        onChange={(radius) => updateLayer("qr", { radius })}
                        suffix="px"
                      />

                      <ColorField
                        label="Tile colour"
                        value={sel.bg}
                        onChange={(bgColor) =>
                          updateLayer("qr", { bg: bgColor })
                        }
                      />
                    </>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Slider
                      label="Position X"
                      value={sel.x}
                      min={0}
                      max={100}
                      step={0.5}
                      onChange={(x) => updateLayer(selected, { x })}
                      suffix="%"
                    />

                    <Slider
                      label="Position Y"
                      value={sel.y}
                      min={0}
                      max={100}
                      step={0.5}
                      onChange={(y) => updateLayer(selected, { y })}
                      suffix="%"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => updateLayer(selected, { x: 50 })}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#FF7A00] transition-colors"
                  >
                    Center horizontally
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-[#111214] border border-[#1f2023] p-4 sm:p-6 mb-6">
                {/* Background picker */}
                <div className="mt-6">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
                    Background
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {PRESET_BGS.map((preset) => {
                      const isSelected =
                        bg.type === "preset" && bg.id === preset.id;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            setBg({ type: "preset", id: preset.id })
                          }
                          aria-label={`${preset.id} background`}
                          aria-pressed={isSelected}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            isSelected
                              ? "border-[#FF7A00] scale-110"
                              : "border-white/10 hover:border-white/40"
                          }`}
                          style={{
                            backgroundImage: gradientCss(preset.colors),
                          }}
                        />
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 px-4 h-10 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors ${
                        bg.type === "image"
                          ? "border-[#FF7A00] text-[#FF7A00]"
                          : "border-white/10 text-gray-400 hover:border-[#FF7A00] hover:text-[#FF7A00]"
                      }`}
                    >
                      <ImagePlus size={14} />
                      {bg.type === "image" ? "Change Image" : "Upload Image"}
                    </button>

                    {bg.type === "image" && (
                      <button
                        type="button"
                        onClick={() =>
                          setBg({
                            type: "preset",
                            id: PRESET_BGS[0].id,
                          })
                        }
                        className="flex items-center gap-2 px-3 h-10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                      >
                        <RotateCcw size={13} />
                        Reset
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBgUpload}
                    />
                  </div>

                  <div className="mt-4">
                    <Slider
                      label="Dark overlay"
                      value={layout.overlay}
                      min={0}
                      max={0.8}
                      step={0.05}
                      onChange={(overlay) =>
                        setLayout((prev) => ({ ...prev, overlay }))
                      }
                    />
                  </div>
                </div>
              </div>
              {/* Tip */}
              <div className="mt-8 px-5 py-4 rounded-2xl bg-[#FF7A00]/[0.04] border border-[#FF7A00]/10">
                <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-widest mb-1">
                  Pro Tip
                </p>

                <p className="text-[12px] text-[#6b7280] leading-relaxed">
                  Swipe left or right on the poster, or use the slide controls
                  to switch invitations. Drag elements to reposition them, and
                  use Customize to change colours, sizes and fonts. Your layout
                  is saved for this event in this browser and applies to every
                  download.
                </p>
              </div>
            </div>

            {/* RIGHT: live poster (stays in view while editing on large screens) */}
            <div className="order-1 lg:order-2 min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 [scrollbar-width:thin] [scrollbar-color:#2a2b2f_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2a2b2f] hover:[&::-webkit-scrollbar-thumb]:bg-[#FF7A00]/60">
              {/* Slider actions: Download is at the top */}
              {currentInvitation && (
                <div className="mb-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">
                        Invitation {activeIndex + 1} of {generated.length}
                      </p>

                      <p className="text-[11px] text-gray-500">
                        Each pass has its own QR code
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={busy}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-3 text-xs font-black uppercase tracking-wider text-black hover:bg-[#ff8f1f] transition-colors disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Download size={15} />
                      )}

                      {busy ? "Preparing..." : "Download"}
                    </button>
                  </div>

                  {generated.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadAll}
                      disabled={busy}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#FF7A00] px-4 py-3 text-xs font-black uppercase tracking-wider text-[#FF7A00] hover:bg-[#FF7A00]/10 transition-colors disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Download size={15} />
                      )}
                      {busy
                        ? "Preparing..."
                        : `Download all ${generated.length} (zip)`}
                    </button>
                  )}

                  {generated.length > 1 && (
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => goToSlide(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        aria-label="Previous invitation"
                        className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white hover:border-[#FF7A00] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>

                      <div className="flex flex-1 justify-center items-center gap-1.5 overflow-x-auto py-2">
                        {generated.map((ticket, index) => (
                          <button
                            key={ticket.ticketId}
                            type="button"
                            onClick={() => goToSlide(index)}
                            aria-label={`Show invitation ${index + 1}`}
                            aria-current={
                              activeIndex === index ? "true" : undefined
                            }
                            className={`h-2.5 shrink-0 rounded-full transition-all ${
                              activeIndex === index
                                ? "w-7 bg-[#FF7A00]"
                                : "w-2.5 bg-gray-600 hover:bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => goToSlide(activeIndex + 1)}
                        disabled={activeIndex === generated.length - 1}
                        aria-label="Next invitation"
                        className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white hover:border-[#FF7A00] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-3xl bg-[#111214] border border-[#1f2023] p-4 sm:p-6">
                <div
                  ref={posterRef}
                  className="relative w-full max-w-md mx-auto aspect-[4/5] rounded-2xl overflow-hidden select-none"
                  style={{
                    ...posterBgStyle,
                    containerType: "inline-size",
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onPointerDown={() => setSelected((s) => s)}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `rgba(0,0,0,${layout.overlay})` }}
                  />

                  {/* Text layers */}
                  {TEXT_KEYS.map((key) => {
                    const t = layout[key];
                    const content = textContent[key];

                    if (!t.visible || !content) return null;

                    return (
                      <div
                        key={key}
                        {...dragProps(key)}
                        className="absolute"
                        style={{
                          ...dragStyle(key),
                          left: `${t.x}%`,
                          top: `${t.y}%`,
                          width: `${t.maxWidth}%`,
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                          color: t.color,
                          opacity: t.opacity,
                          fontWeight: t.weight,
                          fontFamily: t.font,
                          fontSize: cqw(t.size),
                          lineHeight: LINE_HEIGHT,
                          letterSpacing: `${t.tracking}em`,
                          overflowWrap: "anywhere",
                          display: "-webkit-box",
                          WebkitLineClamp: MAX_LINES,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {content}
                      </div>
                    );
                  })}

                  {/* QR code slide */}
                  {layout.qr.visible && (
                    <div
                      {...dragProps("qr")}
                      className="absolute shadow-2xl shadow-black/40"
                      style={{
                        ...dragStyle("qr"),
                        left: `${layout.qr.x}%`,
                        top: `${layout.qr.y}%`,
                        width: cqw(layout.qr.size),
                        padding: cqw(layout.qr.padding),
                        background: layout.qr.bg,
                        borderRadius: cqw(layout.qr.radius),
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {currentInvitation ? (
                          <motion.img
                            key={currentInvitation.ticketId}
                            src={currentInvitation.qrCode}
                            alt={`Invitation QR ${activeIndex + 1}`}
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -18 }}
                            transition={{ duration: 0.2 }}
                            className="w-full block pointer-events-none"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full aspect-square flex items-center justify-center bg-gray-100 pointer-events-none">
                            <QrCode className="w-1/2 h-1/2 text-gray-300" />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Slide number */}
                  {currentInvitation && generated.length > 1 && (
                    <div className="absolute bottom-[3%] left-0 right-0 flex justify-center pointer-events-none">
                      <span className="rounded-full bg-black/40 px-3 py-1 text-white/80 text-[10px] font-bold">
                        {activeIndex + 1} / {generated.length}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-center text-[10px] font-bold text-gray-600">
                  Drag any element on the poster to move it. The slide counter
                  is not included in the download.
                </p>

                {/* Current invitation ID */}
                {currentInvitation && (
                  <div className="mt-6 flex items-center justify-between gap-3 bg-[#0a0b0c] rounded-xl border border-[#1f2023] px-4 py-3">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      Invitation ID
                    </span>

                    <span className="text-[11px] text-[#6b7280] truncate font-mono">
                      {currentInvitation.ticketId}
                    </span>
                  </div>
                )}
              </div>
              {/* Bottom actions */}
              {currentInvitation && (
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-[#FF7A00] border border-[#FF7A00] hover:bg-[#FF7A00] hover:text-black transition-colors disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Share2 size={16} strokeWidth={2.5} />
                    )}
                    {busy ? "Preparing..." : "Share Current Invitation"}
                  </button>

                  <button
                    type="button"
                    onClick={handleNewGuest}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 border border-white/10 hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors"
                  >
                    <UserPlus size={14} />
                    Create Another Batch
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationQR;
