import type { Request, Response, NextFunction } from "express";
import { User, hashPassword } from "../models/User.js";
import { CapabilityMatrix } from "../models/CapabilityMatrix.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/errors.js";

function sanitize(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    profile: user.profile,
    status: user.status,
  };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists");

    const user = await User.create({ name, email, passwordHash: await hashPassword(password) });
    await CapabilityMatrix.create({ userId: user._id });
    res.status(201).json({
      token: signAccessToken(user._id.toString(), user.role, user.plan),
      refreshToken: signRefreshToken(user._id.toString(), user.role, user.plan),
      user: sanitize(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    if (user.status === "suspended") {
      throw new ApiError(403, "ACCOUNT_SUSPENDED", "This account is suspended");
    }
    res.json({
      token: signAccessToken(user._id.toString(), user.role, user.plan),
      refreshToken: signRefreshToken(user._id.toString(), user.role, user.plan),
      user: sanitize(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) throw new ApiError(400, "VALIDATION_ERROR", "refreshToken is required");
    const payload = verifyToken(refreshToken);
    if (payload.type !== "refresh") throw new ApiError(401, "TOKEN_INVALID", "Wrong token type");
    const user = await User.findById(payload.sub);
    if (!user || user.status === "suspended") {
      throw new ApiError(401, "TOKEN_INVALID", "User no longer active");
    }
    res.json({
      token: signAccessToken(user._id.toString(), user.role, user.plan),
      refreshToken: signRefreshToken(user._id.toString(), user.role, user.plan),
    });
  } catch (err) {
    next(err);
  }
}
