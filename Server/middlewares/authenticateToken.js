import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const authenticateTokenMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = user;

    next();
  } catch (error) {
    // 401 (not 403) so the client's interceptor knows to try a token refresh.
    return res.status(401).json({ message: error.message });
  }
};
