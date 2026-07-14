import { useState } from "react";
import {
  LogIn,
  Zap,
  Archive,
  Trash2,
  CheckCircle2,
  Database,
  AlertTriangle,
  Mail,
  Webhook,
  BellRing,
} from "lucide-react";

import { Toggle } from "@/components/Reusable";
const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-[#8a8683] mb-1.5">{label}</p>
    <div className="w-full rounded-lg bg-[#141313] border border-[#5a4136]/40 px-3 py-2 text-sm text-[#e5e2e1]">
      {value}
    </div>
  </div>
);

const ProgressRow = ({ label, value, displayValue, tone = "teal" }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <p className="text-xs font-semibold text-[#8a8683]">{label}</p>
      <span
        className={`text-xs font-semibold ${
          tone === "teal" ? "text-[#4dd4c0]" : "text-[#e5e2e1]"
        }`}
      >
        {displayValue}
      </span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-[#141313] overflow-hidden">
      <div
        className={`h-full rounded-full ${
          tone === "teal" ? "bg-[#4dd4c0]" : "bg-[#ff6b00]"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// ---------- Log Retention Life Cycle ----------

const stages = [
  {
    key: "ingest",
    label: "Ingest",
    sub: "Real-Time Stream",
    icon: LogIn,
    state: "active",
  },
  {
    key: "hot",
    label: "Active (30 Days)",
    sub: "Hot Storage",
    icon: Zap,
    state: "active",
  },
  {
    key: "cold",
    label: "Archived (6 Months)",
    sub: "Cold Storage",
    icon: Archive,
    state: "idle",
  },
  {
    key: "deleted",
    label: "Deleted",
    sub: "Permanent Purge",
    icon: Trash2,
    state: "idle",
  },
];

const LifecycleTimeline = () => (
  <div className="relative flex items-start justify-between px-2">
    {/* connecting line */}
    <div className="absolute left-[6%] right-[6%] top-6 h-px bg-[#3a3736]" />
    <div className="absolute left-[6%] w-[30%] top-6 h-px bg-[#ff6b00]" />

    {stages.map((stage) => {
      const Icon = stage.icon;
      const active = stage.state === "active";
      return (
        <div
          key={stage.key}
          className="relative z-10 flex flex-col items-center w-1/4"
        >
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center border ${
              active
                ? "bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff6b00]"
                : "bg-[#232120] border-[#3a3736] text-[#6b6866]"
            }`}
          >
            <Icon size={20} />
          </div>
          <p
            className={`mt-3 text-xs font-bold text-center ${
              active ? "text-[#e5e2e1]" : "text-[#6b6866]"
            }`}
          >
            {stage.label}
          </p>
          <p className="text-[10px] tracking-wide uppercase text-[#6b6866] mt-0.5 text-center">
            {stage.sub}
          </p>
        </div>
      );
    })}
  </div>
);

const LogRetentionCard = () => (
  <div className="bg-[#1c1b1b] border border-[#5a4136]/40 rounded-xl overflow-hidden">
    <div className="p-6 border-b border-[#5a4136]/40 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-bold text-[#e5e2e1]">
          Log Retention Life Cycle
        </h2>
        <p className="text-sm text-[#e2bfb0] opacity-70 mt-1">
          Automated data purging and archival workflows
        </p>
      </div>
      <div className="bg-[#ff6b00] px-4 py-1.5 rounded-full flex-shrink-0">
        <span className="text-[11px] font-bold tracking-wide text-[#2a1000] uppercase">
          Active Policy: 30-Day Archive
        </span>
      </div>
    </div>

    <div className="px-10 py-10">
      <LifecycleTimeline />
    </div>

    <div className="mx-6 mb-6 rounded-lg border border-[#5a4136]/40 bg-[#141313]/40 p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="flex gap-3">
        <CheckCircle2
          size={16}
          className="text-[#4dd4c0] flex-shrink-0 mt-0.5"
        />
        <div>
          <p className="text-xs font-bold text-[#e5e2e1]">GDPR Compliance</p>
          <p className="text-xs text-[#8a8683] mt-1 leading-relaxed">
            Policies automatically align with EU data sovereignty standards.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Database size={16} className="text-[#8a8683] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-[#e5e2e1]">Current Usage</p>
          <p className="text-xs text-[#8a8683] mt-1 leading-relaxed">
            1.2 TB Hot Storage / 4.8 TB Archival Storage.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <AlertTriangle
          size={16}
          className="text-[#e0a339] flex-shrink-0 mt-0.5"
        />
        <div>
          <p className="text-xs font-bold text-[#e5e2e1]">Auto-Purge</p>
          <p className="text-xs text-[#8a8683] mt-1 leading-relaxed">
            Next system-wide purge scheduled for Sunday, 02:00 AM.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ---------- Notification Hub ----------

const ChannelCard = ({
  icon: Icon,
  title,
  on,
  onToggle,
  disabled,
  children,
  footer,
}) => (
  <div className="bg-[#1c1b1b] border border-[#5a4136]/40 rounded-xl p-5 flex flex-col gap-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-[#141313] border border-[#5a4136]/40 flex items-center justify-center text-[#ff9a52]">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-bold text-[#e5e2e1]">{title}</h3>
      </div>
      <Toggle on={on} onChange={onToggle} disabled={disabled} />
    </div>

    <div className="flex flex-col gap-4 flex-1">{children}</div>

    <button
      type="button"
      disabled={disabled}
      className={`w-full rounded-lg border py-2 text-xs font-semibold transition-colors ${
        disabled
          ? "border-[#3a3736] text-[#5c5957] cursor-not-allowed"
          : "border-[#5a4136]/50 text-[#e5e2e1] hover:bg-[#141313]"
      }`}
    >
      Test Channel
    </button>
    {footer}
  </div>
);

const NotificationHub = () => {
  const [emailOn, setEmailOn] = useState(true);
  const [slackOn, setSlackOn] = useState(true);
  const [pushOn, setPushOn] = useState(true); // toggle itself is on, but disabled by admin

  return (
    <div>
      <h2 className="text-lg font-bold text-[#ff6b00]">Notification Hub</h2>
      <p className="text-sm text-[#e2bfb0] opacity-70 mt-1 mb-6">
        Configure and monitor outbound communication relays
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChannelCard
          icon={Mail}
          title="Email Relay"
          on={emailOn}
          onToggle={setEmailOn}
        >
          <Field label="Provider" value="Amazon SES (us-east-1)" />
          <ProgressRow
            label="Success Rate"
            value={99.8}
            displayValue="99.8%"
            tone="teal"
          />
        </ChannelCard>

        <ChannelCard
          icon={Webhook}
          title="Slack Webhooks"
          on={slackOn}
          onToggle={setSlackOn}
        >
          <Field label="Active Channels" value="#ops-alerts, #dev-logs" />
          <ProgressRow
            label="Avg. Latency"
            value={20}
            displayValue="140ms"
            tone="teal"
          />
        </ChannelCard>

        <ChannelCard
          icon={BellRing}
          title="Push Alerts"
          on={pushOn}
          onToggle={setPushOn}
          disabled
        >
          <Field label="Service" value="Firebase Cloud Messaging" />
          <div>
            <p className="text-xs font-semibold text-[#8a8683] mb-1.5">
              Status
            </p>
            <p className="text-xs italic text-[#e0a339]">Disabled by Admin</p>
          </div>
        </ChannelCard>
      </div>
    </div>
  );
};

// ---------- Page ----------

const AdminSetting = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[#e5e2e1]">
        System Maintenance
      </h1>
      <p className="text-sm text-[#e2bfb0] opacity-70 mt-2 max-w-xl">
        Manage system-wide data retention policies and global communication
        channels from a unified terminal.
      </p>
    </div>

    <LogRetentionCard />
    <NotificationHub />
  </div>
);

export default AdminSetting;
