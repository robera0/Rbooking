import React from "react";
import PaymentGateways from "./PaymentGateways";

const PaymentSettings = () => {
  return (
    <div className="min-h-screen w-full">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-5xl uppercase tracking-tighter leading-none">
          Payment <span className="text-[#FF7A00]">Settings</span>
        </h1>
        <div className="space-y-2 mb-8 border-b border-white/[0.04] pb-6"></div>

        <PaymentGateways />
      </div>
    </div>
  );
};

export default PaymentSettings;
