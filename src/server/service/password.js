import bcrypt from "bcrypt";

const hashPasswords = async (passwords) => {
  return await bcrypt.hash(passwords, 10);
};

export const comparePassword = (plainPassword, hashPassword) => {
  const hashPassword = hashPasswords(plainPassword);
  return bcrypt.compare(plainPassword, hashPassword);
};
