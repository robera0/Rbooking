import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const authenticateTokenMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;
  console.log("ACCESS_TOKEN_SECRET:", ACCESS_TOKEN_SECRET);
  console.log("Token from cookie:", token);

  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = user;
    console.log("user is", user);
    next();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  }
};
