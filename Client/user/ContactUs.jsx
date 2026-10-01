import { useEffect } from "react";
import { Instagram, Send, Phone, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const CONTACT_LINKS = [
  {
    label: "Instagram",
    value: "@paysso_event",
    href: "https://www.instagram.com/paysso_event?stkn=MWU0NHZybzY5cWlkdQ%3D%3D&utm_source=qr",
    Icon: Instagram,
  },
  {
    label: "Telegram",
    value: "@datnigga_ting",
    href: "https://t.me/datnigga_ting",
    Icon: Send,
  },
  {
    label: "Phone",
    value: "+251 935 385 438",
    href: "tel:+251935385438",
    Icon: Phone,
  },
];

const ContactUs = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[#121417] text-white px-6 lg:px-12 py-20 sm:py-28">
      <div className="max-w-[720px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF7A00] mb-3">
            We're here to help
          </p>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mb-12">
            Questions about an order, an event, or anything else? Reach us
            directly through any of the channels below.
          </p>
        </motion.div>

        <div className="space-y-4">
          {CONTACT_LINKS.map(({ label, value, href, Icon }, i) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="group flex items-center gap-4 p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#FF7A00]/40 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF7A00]/20 transition-colors">
                <Icon size={20} className="text-[#FF7A00]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-600 mb-1">
                  {label}
                </p>
                <p className="text-sm sm:text-base font-bold text-white truncate">
                  {value}
                </p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-gray-600 group-hover:text-[#FF7A00] transition-colors shrink-0"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
