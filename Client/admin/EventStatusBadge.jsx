import { isPostponed } from "@/lib/postponed";

// Status shown in the event list. Sold Out comes from the sales figures, not
// from the event's own status, so an event flips to Sold Out the moment its
// last ticket goes.
const STATUS_BADGE = {
  active: "app-success-soft app-success-border app-success",
  soldout: "bg-red-500/10 border-red-500/30 text-red-400",
  postponed: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  draft: "bg-gray-500/10 border-gray-500/30 text-gray-400",
};

const EventStatusBadge = ({ event }) => {
  const sales = event?.sales;
  let tone = "active";
  let label = "Active";
  if (event?.status === "draft") {
    tone = "draft";
    label = "Draft";
  } else if (event?.status === "cancelled") {
    tone = "soldout";
    label = "Cancelled";
  } else if (isPostponed(event)) {
    tone = "postponed";
    label = "Postponed";
  } else if (sales?.soldOut) {
    tone = "soldout";
    label = "Sold Out";
  }

  return (
    <div className="w-full">
      <div
        className={`w-full h-8 flex justify-center items-center rounded-md border ${STATUS_BADGE[tone]}`}
      >
        <h1 className="font-black text-[10px] uppercase tracking-widest">
          {label}
        </h1>
      </div>
      {tone === "active" && sales?.soldOutTypes?.length > 0 && (
        <p className="mt-1 text-[10px] text-gray-500">
          {sales.soldOutTypes.join(", ")} sold out
        </p>
      )}
    </div>
  );
};

export default EventStatusBadge;
