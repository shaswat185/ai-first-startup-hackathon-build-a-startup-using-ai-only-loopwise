import { User } from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid registration data", parsed.error.issues.map((i) => i.message), "VALIDATION_ERROR");
  }
  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });
  const token = signToken(user.id.toString());

  res.status(201).json({ user: user.toJSON(), token });
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid login data", parsed.error.issues.map((i) => i.message), "VALIDATION_ERROR");
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = signToken(user._id.toString());
  res.json({ user: user.toJSON(), token });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw ApiError.notFound("User not found", "USER_NOT_FOUND");
  }
  res.json({ user: user.toJSON() });
});

export const logout = asyncHandler(async (req, res) => {
  // JWTs are stateless - the client is responsible for discarding the token.
  res.json({ message: "Logged out successfully" });
});
