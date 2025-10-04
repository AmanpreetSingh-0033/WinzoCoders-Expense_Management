import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth, useAuthHeader } from "@/hooks/useAuth";
import type { User, Role, Expense } from "@shared/api";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Plus, Users, DollarSign, TrendingUp, FileText, Settings, Building2, Globe, Coins, Shield, UserPlus, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { company } = useAuth();
  const headers = useAuthHeader();
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "EMPLOYEE" as Role, managerId: "" });
  const [workflowRules, setWorkflowRules] = useState(company?.rules || { percentage: 0.6, cfoOverride: true, hybrid: true, requireManagerApproval: true });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users", { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        console.log(`Loaded ${data.length} users`);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  const loadExpenses = async () => {
    const res = await fetch("/api/expenses", { headers });
    if (res.ok) setExpenses(await res.json());
  };

  useEffect(() => { loadUsers(); loadExpenses(); }, []);
  
  useEffect(() => {
    console.log("User dialog state:", showUserDialog);
  }, [showUserDialog]);

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: headers,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete user");
      }

      toast.success(`User "${userName}" deleted successfully`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const createUser = async () => {
    // Validation
    if (!newUser.name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!newUser.email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    if (!newUser.password || newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsCreatingUser(true);
    try {
      const payload = {
        ...newUser,
        managerId: newUser.managerId || undefined, // Convert empty string to undefined
      };
      
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }
      
      const createdUser = await res.json();
      toast.success(`User "${createdUser.name}" created successfully! They can now login with their email and password.`);
      setShowUserDialog(false);
      setNewUser({ name: "", email: "", password: "", role: "EMPLOYEE", managerId: "" });
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
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

  const handleOverride = async (expenseId: string, decision: "APPROVED" | "REJECTED") => {
    const comment = window.prompt(
      `Please provide a reason for ${decision === "APPROVED" ? "approving" : "rejecting"} this expense:`
    );
    
    if (!comment || comment.trim().length === 0) {
      toast.error("A comment is required for admin overrides");
      return;
    }

    try {
      const res = await fetch(`/api/expenses/${expenseId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ decision, comment: comment.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to override");
      }

      toast.success(
        `Expense ${decision === "APPROVED" ? "approved" : "rejected"} via admin override`
      );
      loadExpenses();
    } catch (error: any) {
      toast.error(error.message || "Failed to override expense");
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
    <div className="space-y-8 pb-8 animate-in fade-in duration-500">
      {/* Professional Header with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border shadow-sm">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">Complete control over your organization</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="lg" className="shadow-sm" onClick={() => setShowWorkflowDialog(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Workflow Settings
            </Button>
            
            <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Workflow Configuration
                  </DialogTitle>
                  <DialogDescription>
                    Configure approval rules and conditions for expense processing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentage" className="text-base">Approval Percentage Threshold</Label>
                    <Input 
                      id="percentage"
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1" 
                      value={workflowRules.percentage} 
                      onChange={(e) => setWorkflowRules({ ...workflowRules, percentage: Number(e.target.value) })} 
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground">
                      Example: 0.6 means 60% of approvers must approve
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5">
                        <Label htmlFor="manager" className="text-base font-medium cursor-pointer">Require Manager Approval</Label>
                        <p className="text-sm text-muted-foreground">Employee's manager must approve first (if assigned)</p>
                      </div>
                      <input 
                        id="manager"
                        type="checkbox" 
                        checked={workflowRules.requireManagerApproval !== false} 
                        onChange={(e) => setWorkflowRules({ ...workflowRules, requireManagerApproval: e.target.checked })} 
                        className="h-5 w-5 rounded cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5">
                        <Label htmlFor="cfo" className="text-base font-medium cursor-pointer">CFO Override</Label>
                        <p className="text-sm text-muted-foreground">CFO approval automatically approves expense</p>
                      </div>
                      <input 
                        id="cfo"
                        type="checkbox" 
                        checked={workflowRules.cfoOverride} 
                        onChange={(e) => setWorkflowRules({ ...workflowRules, cfoOverride: e.target.checked })} 
                        className="h-5 w-5 rounded cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5">
                        <Label htmlFor="hybrid" className="text-base font-medium cursor-pointer">Hybrid Mode</Label>
                        <p className="text-sm text-muted-foreground">Use percentage OR CFO override (whichever comes first)</p>
                      </div>
                      <input 
                        id="hybrid"
                        type="checkbox" 
                        checked={workflowRules.hybrid} 
                        onChange={(e) => setWorkflowRules({ ...workflowRules, hybrid: e.target.checked })} 
                        className="h-5 w-5 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={updateWorkflow} className="w-full" size="lg">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Workflow Rules
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<FileText className="h-6 w-6" />}
          title="Total Expenses"
          value={stats.total.toString()}
          subtitle="All time"
          trend="+12% from last month"
          color="blue"
        />
        <StatsCard
          icon={<DollarSign className="h-6 w-6" />}
          title="Total Approved"
          value={`${company?.currency} ${Math.round(stats.totalAmount).toLocaleString()}`}
          subtitle="Approved amount"
          trend="+8% from last month"
          color="green"
        />
        <StatsCard
          icon={<Clock className="h-6 w-6" />}
          title="Pending Review"
          value={stats.pending.toString()}
          subtitle="Awaiting approval"
          trend={stats.pending > 0 ? "Needs attention" : "All clear"}
          color="yellow"
        />
        <StatsCard
          icon={<Users className="h-6 w-6" />}
          title="Team Members"
          value={users.length.toString()}
          subtitle="Active users"
          trend={`${users.filter(u => u.role !== 'ADMIN').length} employees`}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Expenses by Category
            </CardTitle>
            <CardDescription>Distribution of expenses across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={stats.categoryData} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false} 
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100} 
                    fill="#8884d8" 
                    dataKey="value"
                  >
                    {stats.categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No expense data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Expense Status Overview
            </CardTitle>
            <CardDescription>Current status of all expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* All Expenses with Override Actions */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            All Expenses ({expenses.length})
          </CardTitle>
          <CardDescription>View and override expense approvals</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No expenses submitted yet</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Override Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const employee = users.find(u => u.id === expense.employeeId);
                    const isOverridden = expense.overriddenBy;
                    
                    return (
                      <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          {employee?.name || "Unknown"}
                          {isOverridden && (
                            <Badge variant="outline" className="ml-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700">
                              Overridden
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">{expense.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">
                              {company?.currency} {Math.round(expense.convertedAmount).toLocaleString()}
                            </p>
                            {expense.currency !== company?.currency && (
                              <p className="text-xs text-muted-foreground">
                                {expense.currency} {expense.amount}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              expense.status === "APPROVED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : expense.status === "REJECTED"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                            }
                          >
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {expense.status === "PENDING" ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleOverride(expense.id, "APPROVED")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Override Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleOverride(expense.id, "REJECTED")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Override Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {isOverridden ? "Already overridden" : "Already processed"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management & Company Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
              <CardDescription>Manage users and assign roles</CardDescription>
            </div>
            <Button 
              size="sm" 
              className="shadow-sm" 
              onClick={() => {
                console.log("Opening user dialog...");
                setShowUserDialog(true);
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            
            <Dialog open={showUserDialog} onOpenChange={(open) => {
              console.log("Dialog onOpenChange:", open);
              setShowUserDialog(open);
            }}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Create New User
                  </DialogTitle>
                  <DialogDescription>
                    Add a new team member to your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      placeholder="John Doe"
                      value={newUser.name} 
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="john@company.com"
                      value={newUser.email} 
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="Minimum 6 characters"
                      value={newUser.password} 
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as Role })}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee - Submit expenses</SelectItem>
                        <SelectItem value="MANAGER">Manager - Approve expenses</SelectItem>
                        <SelectItem value="FINANCE">Finance - Financial approval</SelectItem>
                        <SelectItem value="DIRECTOR">Director - High-level approval</SelectItem>
                        <SelectItem value="CFO">CFO - Executive approval</SelectItem>
                        <SelectItem value="ADMIN">Admin - Full control</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager (optional)</Label>
                    <Select value={newUser.managerId || "none"} onValueChange={(v) => setNewUser({ ...newUser, managerId: v === "none" ? "" : v })}>
                      <SelectTrigger id="manager">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {users.filter(u => ["MANAGER", "ADMIN"].includes(u.role)).map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createUser} className="w-full" size="lg" disabled={isCreatingUser}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreatingUser ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            u.role === "ADMIN" ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100" :
                            u.role === "CFO" ? "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100" :
                            u.role === "DIRECTOR" ? "bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100" :
                            u.role === "FINANCE" ? "bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100" :
                            u.role === "MANAGER" ? "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100" :
                            "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100"
                          }
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(u.id, u.name)}
                          disabled={deletingUserId === u.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {deletingUserId === u.id ? (
                            <>
                              <Clock className="h-4 w-4 mr-1 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Company Information
            </CardTitle>
            <CardDescription>Organization details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Company Name</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{company?.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Country</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{company?.country}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Coins className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Base Currency</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{company?.currency}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Workflow Rules
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Manager Approval</span>
                  <Badge variant={workflowRules.requireManagerApproval !== false ? "default" : "outline"}>
                    {workflowRules.requireManagerApproval !== false ? "Required" : "Optional"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Approval Threshold</span>
                  <Badge variant="secondary">{Math.round((workflowRules.percentage || 0) * 100)}%</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">CFO Override</span>
                  <Badge variant={workflowRules.cfoOverride ? "default" : "outline"}>
                    {workflowRules.cfoOverride ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Hybrid Mode</span>
                  <Badge variant={workflowRules.hybrid ? "default" : "outline"}>
                    {workflowRules.hybrid ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string;
  trend: string;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
    green: "bg-green-500/10 text-green-600 ring-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-600 ring-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-600 ring-purple-500/20",
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{subtitle}</p>
              <p className="text-xs font-medium text-primary">{trend}</p>
            </div>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-4 ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
