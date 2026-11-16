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
