import express from "express";
import Expense from "../models/Expense.js";
const router = express.Router();

// Create
router.post("/", async (req, res) => {
  try {
    console.log("Received expense data:", req.body);

    // Ensure approvalSequence is provided or create a default one
    const submitterId = req.body.submitter?._id || req.body.submitter;

    if (!submitterId) {
      return res.status(400).json({
        error:
          "Submitter ID is required. Please ensure you are logged in properly.",
      });
    }

    const expenseData = {
      ...req.body,
      company: req.body.company?._id || req.body.company, // Extract ObjectId from company object
      submitter: submitterId, // Extract ObjectId from submitter object if needed
      expenseDate: new Date(req.body.expenseDate), // Convert string to Date
      approvalSequence: req.body.approvalSequence || [
        {
          approver: submitterId, // Default to submitter for now
          status: "pending",
        },
      ],
    };

    console.log("Processed expense data:", expenseData);
    const expense = await Expense.create(expenseData);
    res.status(201).json(expense);
  } catch (err) {
    console.error("Expense creation error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  try {
    let query = {};

    // Filter by company if provided
    if (req.query.company_id) {
      query.company = req.query.company_id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by submitter if provided
    if (req.query.submitter) {
      query.submitter = req.query.submitter;
    }

    // Filter by approver for pending approvals
    if (req.query.approverId) {
      query["approvalSequence.approver"] = req.query.approverId;
      query["approvalSequence.status"] = "pending";
    }

    const expenses = await Expense.find(query).populate(
      "submitter company approvalSequence.approver"
    );
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate(
      "submitter company approvalSequence.approver"
    );
    if (!expense) return res.status(404).json({ error: "Not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!expense) return res.status(404).json({ error: "Not found" });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve expense
router.post("/:id/approve", async (req, res) => {
  try {
    const { approverId, comment } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Update the approval sequence
    const approverIndex = expense.approvalSequence.findIndex(
      (seq) =>
        seq.approver.toString() === approverId && seq.status === "pending"
    );

    if (approverIndex === -1) {
      return res
        .status(400)
        .json({ error: "No pending approval found for this approver" });
    }

    expense.approvalSequence[approverIndex].status = "approved";
    expense.approvalSequence[approverIndex].comment = comment;
    expense.approvalSequence[approverIndex].actionDate = new Date();

    // Check if all approvals are complete
    const allApproved = expense.approvalSequence.every(
      (seq) => seq.status === "approved"
    );
    if (allApproved) {
      expense.status = "approved";
    }

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error("Expense approval error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Reject expense
router.post("/:id/reject", async (req, res) => {
  try {
    const { approverId, comment } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Update the approval sequence
    const approverIndex = expense.approvalSequence.findIndex(
      (seq) =>
        seq.approver.toString() === approverId && seq.status === "pending"
    );

    if (approverIndex === -1) {
      return res
        .status(400)
        .json({ error: "No pending approval found for this approver" });
    }

    expense.approvalSequence[approverIndex].status = "rejected";
    expense.approvalSequence[approverIndex].comment = comment;
    expense.approvalSequence[approverIndex].actionDate = new Date();
    expense.status = "rejected";

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error("Expense rejection error:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
