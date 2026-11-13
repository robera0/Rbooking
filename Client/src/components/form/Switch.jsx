// An on/off switch. The label is for screen readers; show your own text next to it.
const Switch = ({ checked, onChange, label, disabled = false, id }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={Boolean(checked)}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-[42px] flex-shrink-0 rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? "bg-[#FF7A00]" : "bg-white/[0.12]"
    }`}
  >
    <span
      className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
        checked ? "left-[21px]" : "left-[3px]"
      }`}
    />
  </button>
);

export default Switch;
