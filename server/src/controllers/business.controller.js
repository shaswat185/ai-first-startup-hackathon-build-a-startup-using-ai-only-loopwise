import mongoose from "mongoose";
import { Business } from "../models/Business.js";
import { Diagnosis } from "../models/Diagnosis.js";
import { businessSchema, businessUpdateSchema } from "../validators/business.validators.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest("Invalid business id", [], "INVALID_ID");
  }
}

async function findOwnedBusiness(id, userId) {
  assertValidId(id);
  const business = await Business.findOne({ _id: id, userId });
  if (!business) {
    throw ApiError.notFound("Business not found", "BUSINESS_NOT_FOUND");
  }
  return business;
}

export const listBusinesses = asyncHandler(async (req, res) => {
  const businesses = await Business.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ businesses: businesses.map((b) => b.toJSON()) });
});

export const createBusiness = asyncHandler(async (req, res) => {
  const parsed = businessSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid business data", parsed.error.issues.map((i) => i.message), "VALIDATION_ERROR");
  }

  const business = await Business.create({ ...parsed.data, userId: req.userId });
  res.status(201).json({ business: business.toJSON() });
});

export const getBusiness = asyncHandler(async (req, res) => {
  const business = await findOwnedBusiness(req.params.id, req.userId);
  res.json({ business: business.toJSON() });
});

export const updateBusiness = asyncHandler(async (req, res) => {
  const parsed = businessUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid business data", parsed.error.issues.map((i) => i.message), "VALIDATION_ERROR");
  }

  const business = await findOwnedBusiness(req.params.id, req.userId);
  Object.assign(business, parsed.data);
  await business.save();

  res.json({ business: business.toJSON() });
});

export const deleteBusiness = asyncHandler(async (req, res) => {
  const business = await findOwnedBusiness(req.params.id, req.userId);
  await Diagnosis.deleteMany({ businessId: business._id, userId: req.userId });
  await business.deleteOne();
  res.json({ message: "Business deleted" });
});
