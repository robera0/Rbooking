import { generateRefreshToken, generateAccessToken } from "../service/token.js";
import { hashPasswords, comparePassword } from "../service/password.js";
import { UserModel } from "../models/UserModel.js";
import dotenv from "dotenv";
import { AdminProfile } from "../models/AdminProfileModel.js";
import jwt from "jsonwebtoken";
dotenv.config();

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

/*export const register_admin = async (req, res) => {
  try {
    let {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      organizationName,
      businessType,
      businessRegistrationNumber,
      taxId,
      country,
      city,
      region,
      streetAddress,
      adminRole,
      twoFactorEnabled,
    } = req.body;

    // Trim all string fields
    username = typeof username === "string" ? username.trim() : username;
    email = typeof email === "string" ? email.trim().toLowerCase() : email;
    password = typeof password === "string" ? password.trim() : password;
    firstName = typeof firstName === "string" ? firstName.trim() : firstName;
    lastName = typeof lastName === "string" ? lastName.trim() : lastName;
    phone = typeof phone === "string" ? phone.trim() : phone;
    organizationName =
      typeof organizationName === "string"
        ? organizationName.trim()
        : organizationName;
    businessType =
      typeof businessType === "string" ? businessType.trim() : businessType;
    businessRegistrationNumber =
      typeof businessRegistrationNumber === "string"
        ? businessRegistrationNumber.trim()
        : businessRegistrationNumber;
    taxId = typeof taxId === "string" ? taxId.trim() : taxId;
    country = typeof country === "string" ? country.trim() : country;
    city = typeof city === "string" ? city.trim() : city;
    region = typeof region === "string" ? region.trim() : region;
    streetAddress =
      typeof streetAddress === "string" ? streetAddress.trim() : streetAddress;
    adminRole = typeof adminRole === "string" ? adminRole.trim() : adminRole;

    const existingUser = await Admin.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const hashedPassword = await hashPasswords(password);
    const user = {
      username,
      email,
      password: hashedPassword,
      role: "admin",
      firstName,
      lastName,
      phone,
      organizationName,
      businessType,
      businessRegistrationNumber,
      taxId,
      country,
      city,
      region,
      streetAddress,
      adminRole,
      twoFactorEnabled: twoFactorEnabled === "true",
    };
    const newUser = await Admin.create(user);

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("register user error:", error);
    return res.status(500).json({
      message: "The user cannot be registered ",
      error: error.message,
    });
  }
};
*/
// REGISTER USER

export const register_user = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await hashPasswords(password);

    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "User registration failed",
    });
  }
};
export const login_user = async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) return res.status(400).json({ message: "your are not a user" });
  if (user.status === "banned") {
    return res.status(400).json({ message: "your banned from using Paysso" });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const access_token = generateAccessToken(payload);
  const refresh_token = generateRefreshToken(payload);
  user.refreshTokens.push({ token: refresh_token });
  await user.save();

  res
    .cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .status(200)
    .json({ role: user.role, message: "Logged in successfully" });
};

export const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token)
      return res.status(401).json({ message: "their is no refresh_token" });

    jwt.verify(refresh_token, REFRESH_TOKEN_SECRET, async (error, decoded) => {
      if (error) return res.status(401).json({ message: error.message });
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const tokenExists = user.refreshTokens.some(
        (t) => t.token === refresh_token,
      );
      if (!tokenExists) {
        return res.status(403).json({ message: "Token mismatch" });
      }
      const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(payload);
      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    console.log(refresh_token);

    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const user = await UserModel.findOne({
      "refreshTokens.token": refresh_token,
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or token invalid" });
    }

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== refresh_token,
    );

    await user.save();

    res
      .clearCookie("access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
      })
      .clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
      })
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
