import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, useAuthHeader } from "@/hooks/useAuth";
import type { Expense, User, Role } from "@shared/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Plus, Users, DollarSign, TrendingUp, FileText, Upload } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in to access dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Use the buttons in the header to log in or create your company. This enables role-based routes and API access.</p>
        </CardContent>
      </Card>
    );
  }

  // Redirect to role-specific dashboard
  const roleRoutes: Record<string, string> = {
    ADMIN: "/admin/dashboard",
    MANAGER: "/manager/dashboard",
    FINANCE: "/manager/dashboard",
    DIRECTOR: "/manager/dashboard",
    CFO: "/manager/dashboard",
    EMPLOYEE: "/employee/dashboard",
  };

  const redirectPath = roleRoutes[user.role] || "/employee/dashboard";
  return <Navigate to={redirectPath} replace />;
}

function EmployeePanel() {
  const { company } = useAuth();
  const headers = useAuthHeader();
  const [submitting, setSubmitting] = useState(false);
  const [list, setList] = useState<Expense[]>([]);
  const [form, setForm] = useState({ amount: "", currency: company?.currency || "USD", category: "Meals", description: "", date: format(new Date(), "yyyy-MM-dd"), ocr: "" });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const load = async () => {
    const res = await fetch("/api/expenses", { headers });
    if (res.ok) setList(await res.json());
  };
  useEffect(() => { load(); }, []);

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
        body: formData 
      });
      if (!res.ok) throw new Error();
      toast.success("Expense submitted for approval");
      setForm({ ...form, amount: "", description: "" });
      setReceiptFile(null);
      load();
    } catch {
      toast.error("Failed to submit expense");
    } finally {
      setSubmitting(false);
    }
  };

  const autofill = () => {
    const text = form.ocr;
    const amount = parseFloat((text.match(/\d+[\.,]?\d*/)?.[0] || "0").replace(",", "."));
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}|\d{2}[\/.-]\d{2}[\/.-]\d{4}/)?.[0];
    setForm((f) => ({ ...f, amount: amount ? String(amount) : f.amount, description: text.slice(0, 120), date: dateMatch ? normalizeDate(dateMatch) : f.date }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Amount</label>
                <Input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm">Currency</label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} placeholder="USD" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Category</label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Receipt upload</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {receiptFile && <span className="text-xs text-muted-foreground">{receiptFile.name}</span>}
              </div>
            </div>
            <div>
              <label className="text-sm">OCR quick paste</label>
              <Textarea placeholder="Paste receipt text to auto-fill" value={form.ocr} onChange={(e) => setForm({ ...form, ocr: e.target.value })} />
              <div className="flex justify-end mt-2"><Button type="button" variant="secondary" onClick={autofill}>Auto-fill</Button></div>
            </div>
            <Button disabled={submitting} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Submit expense"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My expenses</CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportCSV(list)}>Export CSV</Button>
        </CardHeader>
        <CardContent>
          <ExpensesTable items={list} />
        </CardContent>
      </Card>
    </div>
  );
}

function ManagerPanel() {
  const headers = useAuthHeader();
  const [list, setList] = useState<Expense[]>([]);
  const load = async () => {
    const res = await fetch("/api/expenses", { headers });
    if (res.ok) setList(await res.json());
  };
  useEffect(() => { load(); }, []);

  const decide = async (id: string, decision: "APPROVED" | "REJECTED") => {
    const comment = window.prompt("Add a comment (optional)") || undefined;
    const res = await fetch(`/api/expenses/${id}/decision`, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify({ decision, comment }) });
    if (res.ok) { toast.success(decision === "APPROVED" ? "Approved" : "Rejected"); load(); } else { toast.error("Action failed"); }
  };

  return (
    <div className="grid lg:grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.filter((e) => e.status === "PENDING").map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.employeeId}</TableCell>
                  <TableCell>{e.convertedAmount} {e.convertedCurrency}</TableCell>
                  <TableCell>{e.status}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => decide(e.id, "APPROVED")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => decide(e.id, "REJECTED")}>Reject</Button>
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

function AdminPanel() {
  const { company } = useAuth();
  const headers = useAuthHeader();
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "EMPLOYEE" as Role, managerId: "" });
  const [workflowRules, setWorkflowRules] = useState(company?.rules || { percentage: 0.6, cfoOverride: true, hybrid: true });

  const loadUsers = async () => {
    const res = await fetch("/api/users", { headers });
    if (res.ok) setUsers(await res.json());
  };

  const loadExpenses = async () => {
    const res = await fetch("/api/expenses", { headers });
    if (res.ok) setExpenses(await res.json());
  };

  useEffect(() => { loadUsers(); loadExpenses(); }, []);

  const createUser = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error();
      toast.success("User created successfully");
      setShowUserDialog(false);
      setNewUser({ name: "", email: "", password: "", role: "EMPLOYEE", managerId: "" });
      loadUsers();
    } catch {
      toast.error("Failed to create user");
    }
  };

  const updateWorkflow = async () => {
    try {
      const res = await fetch("/api/workflows", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(workflowRules),
      });
      if (!res.ok) throw new Error();
      toast.success("Workflow rules updated");
      setShowWorkflowDialog(false);
    } catch {
      toast.error("Failed to update workflow");
    }
  };

  const stats = useMemo(() => {
    const total = expenses.length;
    const pending = expenses.filter(e => e.status === "PENDING").length;
    const approved = expenses.filter(e => e.status === "APPROVED").length;
    const rejected = expenses.filter(e => e.status === "REJECTED").length;
    const totalAmount = expenses.filter(e => e.status === "APPROVED").reduce((sum, e) => sum + e.convertedAmount, 0);
    
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.convertedAmount;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value: Math.round(value) }));
    const statusData = [
      { name: "Pending", value: pending },
      { name: "Approved", value: approved },
      { name: "Rejected", value: rejected },
    ];

    return { total, pending, approved, rejected, totalAmount, categoryData, statusData };
  }, [expenses]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<FileText />} title="Total Expenses" value={stats.total} />
        <StatCard icon={<DollarSign />} title="Total Approved" value={`${company?.currency} ${Math.round(stats.totalAmount)}`} />
        <StatCard icon={<TrendingUp />} title="Pending" value={stats.pending} />
        <StatCard icon={<Users />} title="Team Members" value={users.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.categoryData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
                  {stats.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage users and roles</CardDescription>
            </div>
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new team member to your organization</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as Role })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="FINANCE">Finance</SelectItem>
                        <SelectItem value="DIRECTOR">Director</SelectItem>
                        <SelectItem value="CFO">CFO</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Manager (optional)</Label>
                    <Select value={newUser.managerId} onValueChange={(v) => setNewUser({ ...newUser, managerId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {users.filter(u => ["MANAGER", "ADMIN"].includes(u.role)).map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createUser} className="w-full">Create User</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell><span className="text-xs bg-primary/10 px-2 py-1 rounded">{u.role}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Workflow Rules</CardTitle>
              <CardDescription>Configure approval workflows</CardDescription>
            </div>
            <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Edit Rules</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Workflow Rules</DialogTitle>
                  <DialogDescription>Configure approval conditions</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Approval Percentage (0-1)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1" 
                      value={workflowRules.percentage} 
                      onChange={(e) => setWorkflowRules({ ...workflowRules, percentage: Number(e.target.value) })} 
                    />
                    <p className="text-xs text-muted-foreground mt-1">e.g., 0.6 = 60% of approvers must approve</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={workflowRules.cfoOverride} 
                      onChange={(e) => setWorkflowRules({ ...workflowRules, cfoOverride: e.target.checked })} 
                    />
                    <Label>CFO Override (CFO approval auto-approves)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={workflowRules.hybrid} 
                      onChange={(e) => setWorkflowRules({ ...workflowRules, hybrid: e.target.checked })} 
                    />
                    <Label>Hybrid Mode (percentage OR CFO override)</Label>
                  </div>
                  <Button onClick={updateWorkflow} className="w-full">Update Rules</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Approval Percentage</dt>
                <dd className="font-medium">{Math.round((workflowRules.percentage || 0) * 100)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">CFO Override</dt>
                <dd className="font-medium">{workflowRules.cfoOverride ? "Enabled" : "Disabled"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Hybrid Mode</dt>
                <dd className="font-medium">{workflowRules.hybrid ? "Enabled" : "Disabled"}</dd>
              </div>
            </dl>
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                <strong>Company:</strong> {company?.name}<br />
                <strong>Country:</strong> {company?.country}<br />
                <strong>Base Currency:</strong> {company?.currency}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function exportCSV(items: Expense[]) {
  const headers = ["Date","Category","Description","Amount","Currency","Status"];
  const rows = items.map(e => [e.date, e.category, (e.description||"").replace(/\n/g, " "), e.convertedAmount, e.convertedCurrency, e.status]);
  const csv = [headers, ...rows].map(r=>r.map(field=>`"${String(field).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `expenses-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function ExpensesTable({ items }: { items: Expense[] }) {
  return (
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
        {items.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{e.date}</TableCell>
            <TableCell>{e.category}</TableCell>
            <TableCell className="max-w-[280px] truncate" title={e.description}>{e.description}</TableCell>
            <TableCell>{e.convertedAmount} {e.convertedCurrency}</TableCell>
            <TableCell>{e.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function normalizeDate(s: string) {
  if (/\d{4}-\d{2}-\d{2}/.test(s)) return s;
  const norm = s.replace(/\./g, "/").replace(/-/g, "/");
  const [d, m, y] = norm.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
