import { UserModel } from "../models/user.model.js";

// Must run after authenticateTokenMiddleware. The role comes from the DB, not
// the JWT, so a demoted/banned admin loses access immediately instead of
// keeping it until their token expires.
export const requireAdmin = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id).select("role status");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.user.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

// Same DB-backed status check for any authenticated route.
export const requireActiveUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id).select("status");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }
    next();
  } catch (error) {
    next(error);
  }
};
