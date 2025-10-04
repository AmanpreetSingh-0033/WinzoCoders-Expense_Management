import mongoose from "mongoose";

const approvalHistorySchema = new mongoose.Schema(
  {
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["approved", "rejected", "escalated", "commented"],
    },
    comment: {
      type: String,
      trim: true,
    },
    previousStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "escalated"],
    },
    newStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "escalated"],
    },
    metadata: {
      type: Object,
      default: {},
    },
    actionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

approvalHistorySchema.index({ expense: 1, actionDate: -1 });
approvalHistorySchema.index({ approver: 1, actionDate: -1 });
approvalHistorySchema.index({ comment: "text" }, { weights: { comment: 1 } });

const ApprovalHistory = mongoose.model(
  "ApprovalHistory",
  approvalHistorySchema
);
export default ApprovalHistory;
