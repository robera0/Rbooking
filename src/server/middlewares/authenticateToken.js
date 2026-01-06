import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const authenticateTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);
  jwt.verify(token, ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return res.status(403).json({ message: error });
    console.log(error);
    req.user = user;
    console.log("user is ", user);
    next();
  });
};
