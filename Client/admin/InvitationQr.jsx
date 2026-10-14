import React, { useState, useRef } from "react";
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
const TILE = 380;
const TILE_Y = 640;
const CAPTION_Y = TILE_Y + TILE / 2 + 80;
const GUEST_Y = TILE_Y + TILE / 2 + 160;

const PRESET_BGS = [
  { id: "sunset", colors: ["#FF7A00", "#7a1f00"] },
  { id: "midnight", colors: ["#1e1b4b", "#0f172a"] },
  { id: "emerald", colors: ["#059669", "#022c22"] },
  { id: "rose", colors: ["#e11d48", "#4c0519"] },
  { id: "mono", colors: ["#3f3f46", "#09090b"] },
];

const EMPTY_GUEST = { guestName: "", email: "", phone: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;

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
  ctx.beginPath();

  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
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

const inputClass =
  "w-full bg-[#0a0b0c] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:border-[#FF7A00]/50 outline-none transition-colors";

const InvitationQR = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

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

  const fileInputRef = useRef(null);
  const touchStartX = useRef(null);

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

  // Builds the poster for the currently selected invitation.
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
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, POSTER_W, POSTER_H);

    // 3. Event name
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "800 26px sans-serif";
    ctx.fillText("EVENT", POSTER_W / 2, 110);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 56px sans-serif";
    ctx.fillText(
      fitText(ctx, invitation.eventName || "", POSTER_W - 160),
      POSTER_W / 2,
      185,
    );

    // 4. QR tile
    const tileX = (POSTER_W - TILE) / 2;
    const tileY = TILE_Y - TILE / 2;

    ctx.fillStyle = "#ffffff";
    fillRoundRect(ctx, tileX, tileY, TILE, TILE, 40);

    const qrImg = await loadImage(invitation.qrCode);

    ctx.drawImage(qrImg, tileX + 30, tileY + 30, TILE - 60, TILE - 60);

    // 5. Caption and guest name
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "700 28px sans-serif";
    ctx.fillText("INVITATION PASS", POSTER_W / 2, CAPTION_Y);

    if (invitation.guestName) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 44px sans-serif";

      ctx.fillText(
        fitText(ctx, invitation.guestName, POSTER_W - 160),
        POSTER_W / 2,
        GUEST_Y,
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
      link.download = posterFileName(generated[0]).replace(
        /^Invitation-(.*?)-[^-]*\.png$/,
        "Invitations-$1.zip",
      );

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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
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

          {/* Invitation poster preview */}
          <div className="rounded-3xl bg-[#111214] border border-[#1f2023] p-4 sm:p-6">
            <div
              className="relative w-full max-w-md mx-auto aspect-[4/5] rounded-2xl overflow-hidden"
              style={{
                ...posterBgStyle,
                containerType: "inline-size",
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="absolute inset-0 bg-black/35" />

              {/* Event name */}
              <div
                className="absolute left-0 right-0 text-center px-[7%]"
                style={{ top: "6.5%" }}
              >
                <p
                  className="font-extrabold text-white/75 tracking-widest"
                  style={{ fontSize: "2.4cqw" }}
                >
                  EVENT
                </p>

                <h2
                  className="font-extrabold text-white truncate"
                  style={{
                    fontSize: "5.2cqw",
                    lineHeight: 1.3,
                  }}
                >
                  {currentInvitation?.eventName || "Your event name"}
                </h2>
              </div>

              {/* QR code slide */}
              <div
                className="absolute left-1/2 bg-white shadow-2xl shadow-black/40"
                style={{
                  width: `${(TILE / POSTER_W) * 100}%`,
                  padding: "2.8%",
                  top: `${(TILE_Y / POSTER_H) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  borderRadius: "10.5%",
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
                      className="w-full block"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-100">
                      <QrCode className="w-1/2 h-1/2 text-gray-300" />
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Caption */}
              <p
                className="absolute left-0 right-0 text-center font-bold text-white/85 tracking-widest"
                style={{
                  top: `${((CAPTION_Y - 28) / POSTER_H) * 100}%`,
                  fontSize: "2.6cqw",
                }}
              >
                INVITATION PASS
              </p>

              {/* Guest name */}
              <p
                className="absolute left-0 right-0 text-center font-extrabold text-white truncate px-[7%]"
                style={{
                  top: `${((GUEST_Y - 44) / POSTER_H) * 100}%`,
                  fontSize: "4.1cqw",
                }}
              >
                {currentInvitation?.guestName || guest.guestName}
              </p>

              {/* Slide number */}
              {currentInvitation && generated.length > 1 && (
                <div className="absolute bottom-[3%] left-0 right-0 flex justify-center">
                  <span className="rounded-full bg-black/40 px-3 py-1 text-white/80 text-[10px] font-bold">
                    {activeIndex + 1} / {generated.length}
                  </span>
                </div>
              )}
            </div>

            {/* Background picker */}
            <div className="mt-6">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
                Background
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {PRESET_BGS.map((preset) => {
                  const selected = bg.type === "preset" && bg.id === preset.id;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setBg({ type: "preset", id: preset.id })}
                      aria-label={`${preset.id} background`}
                      aria-pressed={selected}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selected
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
            </div>

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

          {/* Tip */}
          <div className="mt-8 px-5 py-4 rounded-2xl bg-[#FF7A00]/[0.04] border border-[#FF7A00]/10">
            <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-widest mb-1">
              Pro Tip
            </p>

            <p className="text-[12px] text-[#6b7280] leading-relaxed">
              Swipe left or right on the poster, or use the slide controls to
              switch invitations. Download saves the currently selected pass.
              Every invitation should have its own unique QR code and ticket ID.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationQR;
