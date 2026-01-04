import { generateAccessToken, generateRefreshToken } from "../services.js";
import { comparePassword } from "../service/password.js";
import { UserModel } from "../models/UserModel.js";

export const login = (res, req) => {
  const user = { username: username, password: password };

  const username = user.findOne({ user });
  const access_token = generateAccessToken(user);
  const refresh_token = generateRefreshToken(user);

  refreshTokens.push(refresh_token);

  res.json({ access_token: access_token, refresh_token: refreshTokens });
};

export const refresh = (req, res) => {
  const token = req.body.token;

  if (!token) return res.sendStatus(401);
  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const accessToken = generateAccessToken({ name: user.name });

  res.json({ access_token: accessToken });
};
