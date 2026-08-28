import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import {
  ShieldCheck,
  Ticket,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Camera,
  RefreshCw,
  Scan,
  AlertTriangle,
} from "lucide-react";
import { useService } from "@/Context/ServiceContext";

/* ── Ambient orb decoration ── */
const Orb = ({ className }) => (
  <div
    className={`absolute rounded-full blur-[100px] md:blur-[120px] pointer-events-none ${className}`}
  />
);

/* ── Animated barcode strip ── */
const Barcode = ({ color = "#FF7A00" }) => (
  <div className="flex items-end gap-[2px] h-7 md:h-8 opacity-50">
    {Array.from({ length: 22 }).map((_, i) => (
      <div
        key={i}
        className="rounded-sm"
        style={{
          backgroundColor: color,
          width: i % 3 === 0 ? "3px" : "1.5px",
          height: `${40 + (i % 5) * 12}%`,
        }}
      />
    ))}
  </div>
);

/* ── Particle burst on scan success ── */
const Particles = () =>
  Array.from({ length: 14 }).map((_, i) => {
    const angle = (i / 14) * 360;
    const distance = 60 + Math.random() * 80;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    const colors = ["#FF7A00", "#FACC15", "#34D399", "#60A5FA", "#F472B6"];
    return (
      <motion.div
        key={i}
        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        animate={{ x, y, opacity: 0, scale: 0 }}
        transition={{ duration: 0.8, delay: i * 0.03, ease: "easeOut" }}
        className="absolute w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: colors[i % colors.length],
          left: "50%",
          top: "50%",
          marginLeft: -5,
          marginTop: -5,
        }}
      />
    );
  });

const GateScanner = () => {
  const { API_URL } = useService();
  const [scanResult, setScanResult] = useState(null); // { success: boolean, message: string, ticket?: object }
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setScanResult(null);
    setIsScanning(true);

    try {
      const html5Qrcode = new Html5Qrcode("reader");
      html5QrcodeScannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        onScanSuccess,
        onScanFailure,
      );
    } catch (err) {
      console.error("Camera access error:", err);
      setIsScanning(false);
      setScanResult({
        success: false,
        message: "Unable to access camera. Please check camera permissions.",
      });
    }
  };

  const stopScanner = async () => {
    if (
      html5QrcodeScannerRef.current &&
      html5QrcodeScannerRef.current.isScanning
    ) {
      try {
        await html5QrcodeScannerRef.current.stop();
        html5QrcodeScannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();
    setLoading(true);

    try {
      const payload = JSON.parse(decodedText);

      if (!payload.userTicketId || !payload.token) {
        throw new Error("Invalid ticket QR structure");
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/tickets/qr`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userTicketId: payload.userTicketId,
          token: payload.token,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setScanResult({
          success: true,
          message: data.message || "Entry Granted!",
          ticket: data.ticket,
        });
      } else {
        setScanResult({
          success: false,
          message: data.message || "Entry Denied",
        });
      }
    } catch (err) {
      console.error("Scan processing error:", err);
      setScanResult({
        success: false,
        message: err.message || "Invalid or unreadable QR code.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = () => {
    // Silent handler for non-detected frames
  };

  return (
    <div className="min-h-screen bg-[#121417] text-[#F4F4F5] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <Orb className="w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] -top-[120px] -left-[120px] sm:-top-[220px] sm:-left-[220px] bg-[#FF7A00]/[0.06]" />
      <Orb className="w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] -bottom-[100px] -right-[100px] sm:-bottom-[150px] sm:-right-[150px] bg-emerald-500/[0.04]" />

      {/* Top Accent Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-[2px] flex">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="h-full w-[40%] bg-gradient-to-r from-[#FF7A00] to-amber-300"
        />
        <div className="h-full flex-1 bg-white/[0.03]" />
      </div>

      {/* Back Link */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest z-20"
      >
        <ArrowLeft size={14} />
        <span className="hidden xs:inline">Dashboard</span>
      </Link>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] space-y-5 sm:space-y-6 z-10 pt-8 sm:pt-0"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 mb-2 sm:mb-4"
          >
            <Scan size={28} className="text-[#FF7A00]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-2 sm:mb-3"
          >
            <ShieldCheck size={12} className="text-[#FF7A00]" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.45em]">
              Staff Gate Verification
            </span>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
            Gate Scanner
          </h1>
        </div>

        {/* Camera Viewport & Verification Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl border border-white/[0.08] bg-[#0e0f11] p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl"
        >
          {/* Viewfinder Box */}
          <div className="relative w-full aspect-square bg-[#080809] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
            <div id="reader" className="w-full h-full object-cover"></div>

            {/* Standby / Initial State */}
            {!isScanning && !loading && !scanResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0e0f11] p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
                  <Camera size={28} className="text-gray-500" />
                </div>
                <p className="text-xs text-gray-400 font-medium mb-5 max-w-[220px]">
                  Align attendee ticket QR code within viewfinder
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startScanner}
                  className="px-6 py-3.5 bg-[#FF7A00] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-colors"
                >
                  Activate Camera
                </motion.button>
              </div>
            )}

            {/* Verification Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-[#0e0f11]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <Loader2 size={36} className="animate-spin text-[#FF7A00]" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-300">
                  Verifying Ticket...
                </p>
              </div>
            )}

            {/* Scanning Laser Animation */}
            {isScanning && !loading && (
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  animate={{ y: ["0%", "100%", "0%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent shadow-[0_0_12px_#FF7A00]"
                />
              </div>
            )}
          </div>

          {/* Scan Result Feedback Banner */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                {scanResult.success ? (
                  /* Granted State */
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40">
                        <Particles />
                        <CheckCircle size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          {scanResult.message}
                        </p>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">
                          Entry Allowed
                        </h3>
                      </div>
                    </div>

                    {scanResult.ticket && (
                      <div className="pt-2 border-t border-emerald-500/20 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">
                            Order:
                          </span>
                          <span className="font-mono font-bold text-white">
                            #{scanResult.ticket.orderNo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">
                            Qty:
                          </span>
                          <span className="font-bold text-white">
                            {scanResult.ticket.quantity || 1}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Denied State */
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex items-start gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mt-0.5">
                      <XCircle size={18} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
                        Access Denied
                      </p>
                      <p className="text-xs font-bold text-gray-200 mt-0.5 leading-relaxed">
                        {scanResult.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rescan Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startScanner}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white font-black uppercase text-xs tracking-widest transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>Scan Next Ticket</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Trust Badges */}
          <div className="flex justify-around pt-1">
            {[
              { icon: ShieldCheck, label: "Encrypted" },
              { icon: Ticket, label: "Live Gate" },
              { icon: CheckCircle, label: "Instant Sync" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={13} className="text-gray-700" />
                <span className="text-[7px] font-black text-gray-700 uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Decorative Barcode Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Barcode color="#FF7A00" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GateScanner;
