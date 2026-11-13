// A text box that looks like a text box: a visible outline, a label above it,
// an orange glow while you type, and a reserved line for the error so nothing
// jumps when it appears. `required` adds the orange star.
export const Label = ({ htmlFor, required, children }) => (
  <label
    htmlFor={htmlFor}
    className="mb-2 block text-[12px] font-extrabold uppercase tracking-[0.09em] text-[#8b9097]"
  >
    {children}
    {required && <span className="ml-1 text-[#FF7A00]">*</span>}
  </label>
);

const wrapClass = (error) =>
  `flex cursor-text items-center gap-2.5 rounded-[14px] border-[1.5px] bg-[#1c1f22] px-4 transition focus-within:border-[#FF7A00] focus-within:bg-[#1f2326] focus-within:shadow-[0_0_0_4px_rgba(255,122,0,0.12)] ${
    error ? "border-red-500" : "border-white/[0.16] hover:border-white/[0.28]"
  }`;

const fieldClass =
  "w-full min-w-0 flex-1 bg-transparent py-3.5 text-white outline-none placeholder:text-[#5b6067]";

export const InputBox = ({
  id,
  label,
  required,
  icon: Icon,
  error,
  className = "",
  inputClassName = "",
  reserveError = true,
  ...props
}) => (
  <div className={className}>
    {label && (
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
    )}
    <div className={wrapClass(error)}>
      {Icon && <Icon size={18} className="flex-none text-[#8b9097]" />}
      <input id={id} className={`${fieldClass} ${inputClassName}`} {...props} />
    </div>
    {reserveError && (
      <p className="mx-0.5 mt-1.5 min-h-[20px] text-[12.5px] text-[#ff8a8a]">{error || ""}</p>
    )}
  </div>
);

export const TextAreaBox = ({ id, label, required, error, className = "", counter, ...props }) => (
  <div className={className}>
    {label && (
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
    )}
    <div className={`${wrapClass(error)} items-start`}>
      <textarea
        id={id}
        className={`${fieldClass} min-h-[110px] resize-y leading-relaxed`}
        {...props}
      />
    </div>
    <div className="mx-0.5 mt-1.5 flex min-h-[20px] justify-between text-[12.5px]">
      <span className="text-[#ff8a8a]">{error || ""}</span>
      {counter && <span className="text-[#5b6067]">{counter}</span>}
    </div>
  </div>
);
