import { DatePickerField, TimePickerField } from "@/components/form/DateTimePickers";
import { Label } from "@/components/form/InputBox";
import { endBeforeStart, pushEndWithStart } from "@/lib/eventForm";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const Row = ({ title, required, d, t, onD, onT, minDate, invalid, disabledTime, note }) => (
  <div className="mb-3">
    <Label required={required}>{title}</Label>
    <div className="flex gap-2.5">
      <DatePickerField label={`${title} date`} value={d} onChange={onD} min={minDate} invalid={invalid} />
      <TimePickerField label={`${title} time`} value={t} onChange={onT} invalid={invalid} isDisabled={disabledTime} />
    </div>
    {note && <p className="mx-0.5 mt-1.5 text-[12.5px] text-[#8b9097]">{note}</p>}
  </div>
);

// Start and end. `allowPast` is for events already running or finished, whose
// dates the organizer is only correcting.
const DateTimeSection = ({ form, set, allowPast = false, legacyNoEnd = false, disabled = false, showErrors = false }) => {
  const parts = { startD: form.startD, startT: form.startT, endD: form.endD, endT: form.endT };
  const today = allowPast ? "" : todayStr();
  const bad = endBeforeStart(parts);
  const endMissing = showErrors && !legacyNoEnd && !(form.endD && form.endT);

  const change = (patch) => set(pushEndWithStart({ ...parts, ...patch }));
  const sameDay = form.startD && form.endD && form.startD === form.endD;

  return (
    <div className={disabled ? "pointer-events-none opacity-40" : undefined} aria-disabled={disabled}>
      <Row
        title="Starts"
        required
        d={form.startD}
        t={form.startT}
        onD={(startD) => change({ startD })}
        onT={(startT) => change({ startT })}
        minDate={today}
        invalid={showErrors && !(form.startD && form.startT)}
      />
      <Row
        title="Ends"
        required={!legacyNoEnd}
        d={form.endD}
        t={form.endT}
        onD={(endD) => change({ endD })}
        onT={(endT) => change({ endT })}
        minDate={form.startD || today}
        invalid={bad || endMissing}
        disabledTime={(t) => Boolean(sameDay && form.startT && t <= form.startT)}
        note={
          bad
            ? "The end must be after the start."
            : legacyNoEnd && !form.endD
            ? "This event was made without an end time. You can add one."
            : undefined
        }
      />
    </div>
  );
};

export default DateTimeSection;
