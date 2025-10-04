import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth, useAuthHeader } from "@/hooks/useAuth";
import type { Expense } from "@shared/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { Upload, FileText, DollarSign, Clock, CheckCircle, XCircle, Scan } from "lucide-react";
import { createWorker } from 'tesseract.js';

export default function EmployeeDashboard() {
  const { company } = useAuth();
  const headers = useAuthHeader();
  const [submitting, setSubmitting] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    amount: "",
    currency: company?.currency || "USD",
    category: "Meals",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    ocr: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  const loadExpenses = async () => {
    const res = await fetch("/api/expenses", { headers });
    if (res.ok) setExpenses(await res.json());
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount", form.amount);
      formData.append("currency", form.currency);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("date", form.date);
      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: headers,
        body: formData,
      });
      if (!res.ok) throw new Error();
      toast.success("Expense submitted for approval");
      setForm({ ...form, amount: "", description: "" });
      setReceiptFile(null);
      loadExpenses();
    } catch {
      toast.error("Failed to submit expense");
    } finally {
      setSubmitting(false);
    }
  };

  const processImageWithOCR = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.info("OCR only works with image files");
      return;
    }

    setIsProcessingOCR(true);
    toast.info("Extracting text from receipt image...");

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      console.log("OCR extracted text:", text);
      
      // Auto-fill the form with extracted text
      const amount = parseFloat((text.match(/\d+[\.,]?\d*/)?.[0] || "0").replace(",", "."));
      const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{2}[\/.-]\d{2}[\/.-]\d{4}/)?.[0];
      
      setForm((f) => ({
        ...f,
        amount: amount ? String(amount) : f.amount,
        description: text.slice(0, 120).trim(),
        date: dateMatch ? normalizeDate(dateMatch) : f.date,
        ocr: text,
      }));

      toast.success("Text extracted! Review and edit as needed.");
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Failed to extract text from image");
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setReceiptFile(file);
    
    // Automatically run OCR when image is uploaded
    if (file && file.type.startsWith('image/')) {
      processImageWithOCR(file);
    }
  };

  const autofill = () => {
    const text = form.ocr;
    const amount = parseFloat((text.match(/\d+[\.,]?\d*/)?.[0] || "0").replace(",", "."));
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{2}[\/.-]\d{2}[\/.-]\d{4}/)?.[0];
    setForm((f) => ({
      ...f,
      amount: amount ? String(amount) : f.amount,
      description: text.slice(0, 120),
      date: dateMatch ? normalizeDate(dateMatch) : f.date,
    }));
  };

  const exportCSV = () => {
    const headers = ["Date", "Category", "Description", "Amount", "Currency", "Status"];
    const rows = expenses.map((e) => [
      e.date,
      e.category,
      (e.description || "").replace(/\n/g, " "),
      e.convertedAmount,
      e.convertedCurrency,
      e.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingCount = expenses.filter((e) => e.status === "PENDING").length;
  const approvedCount = expenses.filter((e) => e.status === "APPROVED").length;
  const rejectedCount = expenses.filter((e) => e.status === "REJECTED").length;
  const totalApproved = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((sum, e) => sum + e.convertedAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
        <p className="text-muted-foreground">Submit and track your expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<FileText />} title="Total Submitted" value={expenses.length} color="text-blue-600" />
        <StatCard icon={<Clock />} title="Pending" value={pendingCount} color="text-yellow-600" />
        <StatCard icon={<CheckCircle />} title="Approved" value={approvedCount} color="text-green-600" />
        <StatCard icon={<XCircle />} title="Rejected" value={rejectedCount} color="text-red-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit New Expense</CardTitle>
            <CardDescription>Fill in the details and upload your receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Input
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                    placeholder="USD"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the expense..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Receipt Upload</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleReceiptUpload}
                    className="cursor-pointer"
                    disabled={isProcessingOCR}
                  />
                  {isProcessingOCR && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Scan className="h-4 w-4 animate-pulse" />
                      Processing...
                    </div>
                  )}
                  {receiptFile && !isProcessingOCR && (
                    <span className="text-xs text-muted-foreground">{receiptFile.name}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image and text will be extracted automatically
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Extracted Text (Review & Edit)</label>
                <Textarea
                  placeholder="Text extracted from receipt will appear here..."
                  value={form.ocr}
                  onChange={(e) => setForm({ ...form, ocr: e.target.value })}
                  rows={4}
                />
                <div className="flex justify-between mt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => receiptFile && processImageWithOCR(receiptFile)}
                    disabled={!receiptFile || isProcessingOCR}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Re-scan Receipt
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={autofill} disabled={!form.ocr}>
                    Apply to Form
                  </Button>
                </div>
              </div>
              <Button disabled={submitting} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Expenses</CardTitle>
              <CardDescription>Track your submission history</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Approved Amount</p>
                <p className="text-2xl font-bold">
                  {company?.currency} {Math.round(totalApproved)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>All your submitted expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate" title={expense.description}>
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    {expense.convertedAmount} {expense.convertedCurrency}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        expense.status === "APPROVED"
                          ? "default"
                          : expense.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {expense.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function normalizeDate(s: string) {
  if (/\d{4}-\d{2}-\d{2}/.test(s)) return s;
  const norm = s.replace(/\./g, "/").replace(/-/g, "/");
  const [d, m, y] = norm.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
