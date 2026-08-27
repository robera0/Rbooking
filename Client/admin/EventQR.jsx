import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  QrCode,
  Share2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import api from "../src/Context/api/api.config";
import toast from "react-hot-toast";

const EventQR = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const {
    data: qrData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["eventQR", eventId],
    queryFn: async () => {
      const res = await api.get(`/api/events/${eventId}/qr`);
      return res.data;
    },
    enabled: !!eventId,
    retry: 1,
  });

  const handleDownload = () => {
    if (!qrData?.qrCode) return;

    const link = document.createElement("a");
    link.href = qrData.qrCode;
    link.download = `QR-${qrData.eventName || "event"}-${eventId.slice(-6)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded!");
  };

  const handleCopyLink = async () => {
    if (!qrData?.url) return;
    try {
      await navigator.clipboard.writeText(qrData.url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

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
              Generating QR Code...
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
              Could not generate QR Code
            </p>
            <p className="text-[12px] text-[#6b7280]">
              {error?.response?.data?.message ||
                "Make sure this event has at least one ticket tier."}
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
                    Event QR Code
                  </h1>
                  <p className="text-[12px] text-[#6b7280]">
                    Share this QR code to promote your event
                  </p>
                </div>
              </div>
            </div>

            {/* QR Display Card */}
            <div className="rounded-3xl bg-[#111214] border border-[#1f2023] overflow-hidden">
              {/* Event name banner */}
              <div className="px-8 py-6 border-b border-[#1f2023] bg-gradient-to-r from-[#FF7A00]/[0.04] to-transparent">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#FF7A00] mb-1">
                  Event
                </p>
                <h2 className="text-[18px] font-bold text-white truncate">
                  {qrData.eventName}
                </h2>
              </div>

              {/* QR Code */}
              <div className="px-8 py-12 flex flex-col items-center" ref={qrRef}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="p-6 rounded-3xl bg-white shadow-2xl shadow-black/30"
                >
                  <img
                    src={qrData.qrCode}
                    className="w-56 h-56"
                    alt="Event QR Code"
                  />
                </motion.div>

                <p className="mt-6 text-[11px] font-semibold text-[#6b7280] uppercase tracking-[0.3em]">
                  Scan to view event
                </p>
              </div>

              {/* Link preview */}
              <div className="mx-8 mb-8 flex items-center gap-3 bg-[#0a0b0c] rounded-xl border border-[#1f2023] px-4 py-3">
                <ExternalLink size={14} className="text-[#4b4d52] shrink-0" />
                <span className="text-[11px] text-[#6b7280] truncate flex-1 font-mono">
                  {qrData.url}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  {copied ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} className="text-[#6b7280] hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                className="flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-black bg-[#FF7A00] hover:bg-[#ff8f1f] transition-colors shadow-lg shadow-[#FF7A00]/10"
              >
                <Download size={16} strokeWidth={2.5} />
                Download QR
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-white bg-[#1C1F22] border border-white/[0.08] hover:border-[#FF7A00]/30 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 size={16} strokeWidth={2.5} />
                    Copy Link
                  </>
                )}
              </motion.button>
            </div>

            {/* Tip */}
            <div className="mt-8 px-5 py-4 rounded-2xl bg-[#FF7A00]/[0.04] border border-[#FF7A00]/10">
              <p className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-widest mb-1">
                Pro Tip
              </p>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                Print this QR code on posters, flyers, or social media to let
                people scan and instantly access your event page.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventQR;
