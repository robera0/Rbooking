import { ACCESS_TOKEN_SECRET } from "../service.js";
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
