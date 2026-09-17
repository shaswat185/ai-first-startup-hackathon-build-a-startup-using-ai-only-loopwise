import { z } from "zod";
import { BUSINESS_CATEGORIES } from "../models/Business.js";

const optionalNumber = z.coerce.number().min(0).optional();

export const businessSchema = z.object({
  name: z.string().trim().min(2).max(150),
  category: z.enum(BUSINESS_CATEGORIES, { errorMap: () => ({ message: "Invalid business category" }) }),
  location: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10, "Please describe the business in a bit more detail").max(2000),
  productsOrServices: z.string().trim().min(2).max(1000),
  targetCustomers: z.string().trim().min(2).max(1000),
  monthlyBudget: z.coerce.number().min(0, "Budget cannot be negative"),
  goal: z.string().trim().min(2).max(500),

  monthlyRevenue: optionalNumber,
  customerCount: optionalNumber,
  averageOrderValue: optionalNumber,
  websiteUrl: z.string().trim().max(300).optional().or(z.literal("")),
  socialMediaPresence: z.string().trim().max(500).optional().or(z.literal("")),
  employeeCount: optionalNumber,
});

export const businessUpdateSchema = businessSchema.partial();
