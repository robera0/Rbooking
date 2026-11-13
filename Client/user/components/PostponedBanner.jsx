import { CalendarClock } from "lucide-react";
import {
  isPostponed,
  postponedHeadline,
  originalDateLabel,
} from "@/lib/postponed";

// Shown on a postponed event, and on a buyer's own ticket for one. Nothing
// is rendered for an event that has not been postponed.
const PostponedBanner = ({ event, holder = false, className = "" }) => {
  if (!isPostponed(event)) return null;
  const original = originalDateLabel(event);

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 ${className}`}
    >
      <CalendarClock size={18} className="mt-0.5 shrink-0 text-yellow-400" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-yellow-300">
          {postponedHeadline(event, { holder })}
        </p>
        {original && (
          <p className="mt-0.5 text-xs text-yellow-200/70">
            It was scheduled for {original}.
          </p>
        )}
      </div>
    </div>
  );
};

export default PostponedBanner;
