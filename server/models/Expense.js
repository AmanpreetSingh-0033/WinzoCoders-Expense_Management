import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    convertedAmount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Travel", "Food", "Office", "Accommodation", "Transport", "Other"],
    },
    expenseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "escalated"],
      default: "pending",
    },
    currentApproverIndex: {
      type: Number,
      default: 0,
    },
    approvalSequence: [
      {
        approver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "escalated"],
          default: "pending",
        },
        comment: String,
        actionDate: {
          type: Date,
          default: null,
        },
      },
    ],
    metadata: {
      type: Object,
      default: {},
    },
    attachments: [
      {
        url: String,
        name: String,
        type: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
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

expenseSchema.index({ submitter: 1 });
expenseSchema.index({ company: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ expenseDate: -1 });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
