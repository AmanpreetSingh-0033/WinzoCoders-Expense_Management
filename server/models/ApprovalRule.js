import mongoose from "mongoose";

const approvalRuleSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sequence: [
      {
        approver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    percentageThreshold: {
      type: Number,
      min: 0,
      max: 100,
    },
    specificApprovers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isHybrid: {
      type: Boolean,
      default: false,
    },
    amountThreshold: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    appliesToCategories: [
      {
        type: String,
        enum: [
          "Travel",
          "Food",
          "Office",
          "Accommodation",
          "Transport",
          "Other",
        ],
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

approvalRuleSchema.index({ company: 1, isActive: 1 });
approvalRuleSchema.index({ company: 1, amountThreshold: 1 });

const ApprovalRule = mongoose.model("ApprovalRule", approvalRuleSchema);
export default ApprovalRule;
