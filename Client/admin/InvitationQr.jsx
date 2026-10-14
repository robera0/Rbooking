import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  QrCode,
  Loader2,
  ImagePlus,
  RotateCcw,
} from "lucide-react";
import api from "../src/Context/api/api.config";
import toast from "react-hot-toast";

// Poster size used for the downloaded PNG (4:5). The on-screen preview uses
// the same proportions, so what the admin sees is what they download.
const POSTER_W = 1080;
const POSTER_H = 1350;
const TILE = 380; // white QR tile (QR 320 + 30px padding each side)
const TILE_Y = 640; // tile center Y

const PRESET_BGS = [
  { id: "sunset", colors: ["#FF7A00", "#7a1f00"] },
  { id: "midnight", colors: ["#1e1b4b", "#0f172a"] },
  { id: "emerald", colors: ["#059669", "#022c22"] },
  { id: "rose", colors: ["#e11d48", "#4c0519"] },
  { id: "mono", colors: ["#3f3f46", "#09090b"] },
];

const gradientCss = (colors) =>
  `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Draw an image like CSS background-size: cover
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

const InvitationQR = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  // bg = { type: "preset", id } | { type: "image", src }
  const [bg, setBg] = useState({ type: "preset", id: PRESET_BGS[0].id });
  const fileInputRef = useRef(null);

  const {
    data: qrData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["invitationQR", eventId],
    queryFn: async () => {
      const res = await api.post(
        `/api/auth/admin/events/${eventId}/invitation`,
      );
      const { invitation, eventName } = res.data;
      return {
        qrCode: invitation.qrCode,
        eventName,
        ticketId: invitation.ticketId,
      };
    },
    enabled: !!eventId,
    retry: 1,
  });

  const activePreset =
    bg.type === "preset"
      ? PRESET_BGS.find((p) => p.id === bg.id) || PRESET_BGS[0]
      : null;

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    // Data URL (not object URL) so the canvas stays untainted for download
    const reader = new FileReader();
    reader.onload = () => setBg({ type: "image", src: reader.result });
    reader.onerror = () => toast.error("Could not read that image");
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!qrData?.qrCode || downloading) return;
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = POSTER_W;
      canvas.height = POSTER_H;
      const ctx = canvas.getContext("2d");

      // 1) Background
      if (bg.type === "image") {
        drawCover(ctx, await loadImage(bg.src), POSTER_W, POSTER_H);
      } else {
        const g = ctx.createLinearGradient(0, 0, POSTER_W, POSTER_H);
        g.addColorStop(0, activePreset.colors[0]);
        g.addColorStop(1, activePreset.colors[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, POSTER_W, POSTER_H);
      }

      // 2) Dark overlay so text stays readable on any image
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, POSTER_W, POSTER_H);

      // 3) Event name
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "800 26px sans-serif";
      ctx.fillText("EVENT", POSTER_W / 2, 110);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 56px sans-serif";
      ctx.fillText(
        fitText(ctx, qrData.eventName || "", POSTER_W - 160),
        POSTER_W / 2,
        185,
      );

      // 4) White QR tile + QR
      const tileX = (POSTER_W - TILE) / 2;
      const tileY = TILE_Y - TILE / 2;
      ctx.fillStyle = "#ffffff";
      fillRoundRect(ctx, tileX, tileY, TILE, TILE, 40);
      const qrImg = await loadImage(qrData.qrCode);
      ctx.drawImage(qrImg, tileX + 30, tileY + 30, TILE - 60, TILE - 60);

      // 5) Caption
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "700 28px sans-serif";
      ctx.fillText("INVITATION PASS", POSTER_W / 2, tileY + TILE + 80);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Invitation-${
        qrData?.eventName || "event"
      }-${eventId.slice(-6)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Invitation poster downloaded!");
    } catch (err) {
      console.error("QR download error:", err);
      toast.error("Failed to download QR");
    } finally {
      setDownloading(false);
    }
  };

  const posterBgStyle =
    bg.type === "image"
      ? {
          backgroundImage: `url(${bg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundImage: gradientCss(activePreset.colors) };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="relative z-10 px-2 pt-2 pb-24">
        {/* Back nav */}
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

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={28} className="text-[#FF7A00] animate-spin" />
            <p className="text-[13px] text-[#6b7280] font-medium">
              Loading invitation...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#111214] border border-[#1f2023] p-10 text-center"
          >
            <QrCode size={32} className="text-[#4b4d52] mx-auto mb-4" />
            <p className="text-[14px] font-medium text-[#f4f4f5] mb-1">
              Could not load the invitation QR
            </p>
            <p className="text-[12px] text-[#6b7280]">
              {error?.response?.data?.message ||
                error?.message ||
                "Something went wrong."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 text-[12px] font-bold text-[#FF7A00] uppercase tracking-widest hover:text-white transition-colors"
            >
              Go Back
            </button>
          </motion.div>
        )}

        {/* QR Card */}
        {!isLoading && !isError && qrData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center">
                  <QrCode size={18} className="text-[#FF7A00]" />
                </div>
                <div>
                  <h1 className="text-[20px] font-bold text-[#f4f4f5]">
                    Invitation QR Code
                  </h1>
                  <p className="text-[12px] text-[#6b7280]">
                    Pick a background, then download the invitation poster
                  </p>
                </div>
              </div>
            </div>

            {/* Poster preview (same proportions as the downloaded PNG) */}
            <div className="rounded-3xl bg-[#111214] border border-[#1f2023] p-4 sm:p-6">
              <div
                className="relative w-full max-w-md mx-auto aspect-[4/5] rounded-2xl overflow-hidden"
                style={{ ...posterBgStyle, containerType: "inline-size" }}
              >
                {/* Overlay */}
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
                    style={{ fontSize: "5.2cqw", lineHeight: 1.3 }}
                  >
                    {qrData.eventName}
                  </h2>
                </div>

                {/* Small white QR tile */}
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
                  <img
                    src={qrData.qrCode}
                    className="w-full block"
                    alt="Invitation QR Code"
                  />
                </div>

                {/* Caption */}
                <p
                  className="absolute left-0 right-0 text-center font-bold text-white/85 tracking-widest"
                  style={{ top: "66.5%", fontSize: "2.6cqw" }}
                >
                  INVITATION PASS
                </p>
              </div>

              {/* Background picker */}
              <div className="mt-6">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">
                  Background
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {PRESET_BGS.map((p) => {
                    const selected = bg.type === "preset" && bg.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setBg({ type: "preset", id: p.id })}
                        aria-label={`${p.id} background`}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selected
                            ? "border-[#FF7A00] scale-110"
                            : "border-white/10 hover:border-white/40"
                        }`}
                        style={{ backgroundImage: gradientCss(p.colors) }}
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
                        setBg({ type: "preset", id: PRESET_BGS[0].id })
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

              {/* Invitation ID */}
              <div className="mt-6 flex items-center justify-between gap-3 bg-[#0a0b0c] rounded-xl border border-[#1f2023] px-4 py-3">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                  Invitation ID
                </span>
                <span className="text-[11px] text-[#6b7280] truncate font-mono">
                  {qrData.ticketId}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-black bg-[#FF7A00] hover:bg-[#ff8f1f] transition-colors shadow-lg shadow-[#FF7A00]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} strokeWidth={2.5} />
                )}
                {downloading ? "Preparing..." : "Download Invitation"}
              </motion.button>
            </div>

            {/* Tip */}
            <div className="mt-8 px-5 py-4 rounded-2xl bg-[#FF7A00]/[0.04] border border-[#FF7A00]/10">
              <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-widest mb-1">
                Pro Tip
              </p>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                Use a darker or simple background image so the QR and event name
                stay easy to read and scan. Guests show this pass at the gate.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InvitationQR;
