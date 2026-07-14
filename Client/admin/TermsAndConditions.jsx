import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Ticket,
  CreditCard,
  RefreshCcw,
  AlertTriangle,
  UserCheck,
  Copyright,
  Gavel,
  Mail,
  ArrowRight,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    icon: <UserCheck size={20} />,
    title: "1. Acceptance of Terms",
    body: [
      `By accessing or using the Paysso platform ("Platform", "Service", "we", "us", or "our"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not access or use the Platform.`,
      `You must be at least 18 years old, or the age of legal majority in your jurisdiction, to create an account or purchase tickets through Paysso. By using the Platform you represent that you meet this requirement.`,
    ],
  },
  {
    icon: <Ticket size={20} />,
    title: "2. Tickets & Purchases",
    body: [
      `All tickets sold through Paysso are subject to availability. Once a purchase is confirmed, you will receive a digital ticket tied to your account, which may include a unique QR code or barcode used for entry verification.`,
      `Paysso acts as a platform connecting event organizers with attendees. Event organizers are solely responsible for the accuracy of event details, including date, time, venue, lineup, and age restrictions.`,
      `Resale or transfer of tickets outside features explicitly provided by the Platform is prohibited and may result in ticket invalidation without refund.`,
    ],
  },
  {
    icon: <CreditCard size={20} />,
    title: "3. Payments & Fees",
    body: [
      `All prices displayed are inclusive of applicable service fees unless stated otherwise. Payment must be completed in full at the time of purchase using an accepted payment method.`,
      `Paysso uses third-party payment processors to handle transactions. We do not store your full payment card details on our servers.`,
    ],
  },
  {
    icon: <RefreshCcw size={20} />,
    title: "4. Cancellations & Refunds",
    body: [
      `Refund eligibility is determined by the individual event organizer's refund policy, which is displayed on the event page prior to purchase, unless otherwise required by applicable law.`,
      `If an event is cancelled or postponed by the organizer, Paysso will notify ticket holders and process refunds or transfers in accordance with the organizer's stated policy and applicable consumer protection law.`,
      `Service fees are generally non-refundable except where an event is cancelled entirely by the organizer.`,
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    title: "5. Entry & Event Conduct",
    body: [
      `Entry to an event is subject to the terms set by the event organizer and venue, including security checks, age verification, and venue-specific rules. Paysso is not responsible for entry decisions made by venue staff or organizers.`,
      `You agree not to engage in fraudulent activity, including but not limited to purchasing tickets with stolen payment information, creating duplicate accounts to bypass purchase limits, or attempting to manipulate ticket availability.`,
    ],
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "6. Account Responsibility",
    body: [
      `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.`,
      `Paysso reserves the right to suspend or terminate accounts found to be in violation of these Terms, engaged in fraudulent activity, or abusive toward staff, organizers, or other users.`,
    ],
  },
  {
    icon: <Copyright size={20} />,
    title: "7. Intellectual Property",
    body: [
      `All content on the Platform, including the Paysso name, logo, design, and software, is the property of Paysso or its licensors and is protected by applicable intellectual property laws. You may not copy, modify, or distribute this content without prior written consent.`,
    ],
  },
  {
    icon: <Gavel size={20} />,
    title: "8. Limitation of Liability",
    body: [
      `Paysso provides the Platform on an "as is" and "as available" basis. To the fullest extent permitted by law, Paysso disclaims all warranties and shall not be liable for indirect, incidental, or consequential damages arising from your use of the Platform or attendance at any event.`,
      `Paysso is not responsible for the conduct of event organizers, venues, performers, or other attendees at any event booked through the Platform.`,
    ],
  },
  {
    icon: <FileText size={20} />,
    title: "9. Changes to These Terms",
    body: [
      `We may update these Terms from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. Continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.`,
    ],
  },
];

// ================= COMPONENT =================
const TermsAndConditions = () => {
  const sectionFade = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#121417] text-white selection:bg-[#FF7A00]/20 pb-32">
      {/* ================= HEADER ================= */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        className="px-6 lg:px-10 pt-16 lg:pt-24 pb-14 max-w-[1000px] mx-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center">
            <FileText size={18} />
          </div>
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.35em] text-gray-600">
            Legal
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] uppercase">
          Terms &amp; <span className="text-[#FF7A00]">Conditions</span>
        </h1>
        <p className="mt-6 max-w-xl text-gray-500 text-[13px] md:text-sm font-medium leading-relaxed">
          These Terms govern your access to and use of Paysso. Please read them
          carefully before purchasing tickets or using the Platform.
        </p>
        <p className="mt-4 text-gray-700 text-[10px] font-black uppercase tracking-[0.25em]">
          Last updated · July 14, 2026
        </p>
      </motion.section>

      {/* ================= SECTIONS ================= */}
      <section className="px-6 lg:px-10 max-w-[1000px] mx-auto space-y-4">
        {sections.map((s, i) => (
          <motion.div
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={sectionFade}
            transition={{ delay: i * 0.03 }}
            className="bg-white/[0.02] border border-white/[0.04] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#FF7A00]/5 text-[#FF7A00] flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <h2 className="text-base md:text-xl font-black uppercase italic tracking-tighter text-white">
                {s.title}
              </h2>
            </div>
            <div className="space-y-3 pl-0 md:pl-16">
              {s.body.map((p, j) => (
                <p
                  key={j}
                  className="text-gray-500 text-[12px] md:text-[13px] font-medium leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      {/* ================= CONTACT CTA ================= */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionFade}
        className="px-6 lg:px-10 pt-14 max-w-[1000px] mx-auto"
      >
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-[1.5rem] md:rounded-[2.2rem] p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/5 text-[#FF7A00] flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-sm md:text-lg font-black uppercase italic tracking-tighter text-white">
                Questions About These Terms?
              </h3>
              <p className="text-gray-600 text-[11px] md:text-[12px] font-medium leading-tight mt-1">
                Reach our support team for clarification or assistance.
              </p>
            </div>
          </div>
          <Link
            to="/contact"
            className="group flex items-center gap-2 px-6 py-3 bg-[#FF7A00] text-black text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-full transition-all hover:bg-white active:scale-95 shrink-0"
          >
            Contact Us
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default TermsAndConditions;
