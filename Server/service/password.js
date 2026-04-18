import bcrypt from "bcrypt";

export const hashPasswords = async (passwords) => {
  return await bcrypt.hash(passwords, 10);
};

export const comparePassword = (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
