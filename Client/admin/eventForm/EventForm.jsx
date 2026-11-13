import { ArrowLeft } from "lucide-react";
import { InputBox, TextAreaBox, Label } from "@/components/form/InputBox";
import DateTimeSection from "./DateTimeSection";
import TicketList from "./TicketList";
import MoreOptions, { ToggleRow } from "./MoreOptions";
import CoverCard from "./CoverCard";

const Card = ({ title, required, children }) => (
  <section className="rounded-3xl border border-white/[0.08] bg-[#1c1f22] p-6">
    {title && (
      <h2 className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.09em] text-[#8b9097]">
        {title}{required && <span className="ml-1 text-[#FF7A00]">*</span>}
      </h2>
    )}
    {children}
  </section>
);

// The one layout used by both the Add and Edit pages. The page that uses it
// owns the data and the saving; this only draws the form.
const EventForm = ({
  heading,
  subheading,
  onBack,
  form,
  set,
  checklist,
  showChecklist = true,
  showErrors,
  legacyNoEnd,
  allowPast,
  dateDisabled,
  scheduleExtra,
  moreExtra,
  actions,
  sidebarExtra,
  bottomBar,
}) => {
  const errs = (key) => (showErrors && checklist.find((c) => c.key === key && !c.ok) ? "Required" : "");
  return (
    <div className="w-full pb-28 lg:pb-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button type="button" aria-label="Back" onClick={onBack} className="rounded-full p-2 hover:bg-white/[0.06]"><ArrowLeft size={22} /></button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">{heading}</h1>
            {subheading && <div className="mt-1 text-[14px] text-[#8b9097]">{subheading}</div>}
          </div>
        </div>
        <div className="hidden items-center gap-3 lg:flex">{actions}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <InputBox id="event-name" label="Event name" required value={form.eventName} maxLength={120} placeholder="Give your event a name" onChange={(e) => set({ eventName: e.target.value })} error={errs("name")} />
            <TextAreaBox id="event-desc" label="Description" value={form.description} placeholder="Tell people what to expect" onChange={(e) => set({ description: e.target.value })} reserveError={false} />
          </Card>

          <Card title="Date & time" required>
            <DateTimeSection form={form} set={set} allowPast={allowPast} legacyNoEnd={legacyNoEnd} disabled={dateDisabled} showErrors={showErrors} />
            {scheduleExtra}
          </Card>

          <Card title="Where" required>
            <InputBox id="venue" label="Venue" required value={form.venueName} placeholder="e.g. Millennium Hall" onChange={(e) => set({ venueName: e.target.value })} error={errs("venue")} />
            <div className="grid gap-3 sm:grid-cols-2">
              <InputBox id="city" label="City" value={form.city} placeholder="e.g. Addis Ababa" onChange={(e) => set({ city: e.target.value })} reserveError={false} />
              <InputBox id="address" label="Address" value={form.address} placeholder="e.g. Bole Road" onChange={(e) => set({ address: e.target.value })} reserveError={false} />
            </div>
          </Card>

          <Card title="Tickets" required>
            <TicketList tickets={form.tickets} onChange={(tickets) => set({ tickets })} />
            {showErrors && form.tickets.length === 0 && <p className="mt-2 text-[12.5px] text-[#ff8a8a]">Add at least one ticket</p>}
            <div className="mt-4">
              <ToggleRow title="Show tickets left to buyers" hint="Buyers see how many tickets remain" checked={form.showAvailability} onChange={(v) => set({ showAvailability: v })} />
            </div>
          </Card>

          <MoreOptions form={form} set={set} extra={moreExtra} />
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <CoverCard existing={form.existingPictures} added={form.newPictures} onExisting={(existingPictures) => set({ existingPictures })} onAdded={(newPictures) => set({ newPictures })} checklist={showChecklist ? checklist : null}>
            <div className="hidden lg:block">{sidebarExtra}</div>
          </CoverCard>
          <div className="mt-4 lg:hidden">{sidebarExtra}</div>
        </aside>
      </div>

      {bottomBar && (
        <div className="fixed inset-x-0 bottom-0 z-[60] flex items-center gap-3 border-t border-white/[0.1] bg-[#15171a]/95 px-4 py-3 backdrop-blur lg:hidden">{bottomBar}</div>
      )}
    </div>
  );
};

export { Label };
export default EventForm;
