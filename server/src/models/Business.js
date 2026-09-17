import mongoose from "mongoose";

export const BUSINESS_CATEGORIES = [
  "Retail Store",
  "Restaurant / Café",
  "Freelancer / Service",
  "E-commerce",
  "Education / Coaching",
  "Healthcare / Wellness",
  "Local Shop",
  "Other",
];

const businessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, required: true, enum: BUSINESS_CATEGORIES },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    productsOrServices: { type: String, required: true, trim: true, maxlength: 1000 },
    targetCustomers: { type: String, required: true, trim: true, maxlength: 1000 },
    monthlyBudget: { type: Number, required: true, min: 0 },
    goal: { type: String, required: true, trim: true, maxlength: 500 },

    // Optional context - never force users to provide data they don't know
    monthlyRevenue: { type: Number, min: 0 },
    customerCount: { type: Number, min: 0 },
    averageOrderValue: { type: Number, min: 0 },
    websiteUrl: { type: String, trim: true, maxlength: 300 },
    socialMediaPresence: { type: String, trim: true, maxlength: 500 },
    employeeCount: { type: Number, min: 0 },
  },
  { timestamps: true }
);

businessSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Business = mongoose.model("Business", businessSchema);
