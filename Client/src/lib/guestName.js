// A default name for an invitation guest, so the organizer never has to type
// one. They can change it to the real name whenever they like.
// Letters and digits that are easy to confuse (0/O, 1/I/L) are left out.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 4;

export const makeGuestName = (random = Math.random) => {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_CHARS[Math.floor(random() * CODE_CHARS.length)];
  }
  return `Guest ${code}`;
};

const AUTO_NAME_RE = /^Guest [A-HJ-NP-Z2-9]{4}$/;
export const isAutoGuestName = (name) => AUTO_NAME_RE.test(String(name || "").trim());

// One name per invitation in a batch.
//  - one invitation: the name as typed
//  - the name is still an auto name: the first guest keeps it and every other
//    guest gets a new one of their own
//  - a name the organizer typed: numbered, "Sara 1", "Sara 2", ...
export const batchGuestNames = (name, quantity, random = Math.random) => {
  const base = String(name || "").trim();
  if (quantity <= 1) return [base || makeGuestName(random)];

  if (base && !isAutoGuestName(base)) {
    return Array.from({ length: quantity }, (_, i) => `${base} ${i + 1}`);
  }

  const names = [base || makeGuestName(random)];
  const seen = new Set(names);
  while (names.length < quantity) {
    let next = makeGuestName(random);
    // Only matters if the random source keeps repeating itself.
    for (let n = 2; seen.has(next); n += 1) next = `${next.slice(0, 10)}${n}`;
    seen.add(next);
    names.push(next);
  }
  return names;
};
