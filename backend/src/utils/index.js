import bcrypt from "bcrypt";

export const generatePassword = async (password) => {
  try {
    const salt = Number(process.env.SALT);
    const hash = await bcrypt.genSalt(salt);
    return bcrypt.hash(password, hash);
  } catch (error) {
    console.error(error);
  }
};
