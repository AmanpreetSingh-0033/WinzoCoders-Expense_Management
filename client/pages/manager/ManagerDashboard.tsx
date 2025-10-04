import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth, useAuthHeader } from "@/hooks/useAuth";
import type { Expense } from "@shared/api";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";

export default function ManagerDashboard() {
  const { user, company } = useAuth();
  const headers = useAuthHeader();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", { headers });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (error) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const decide = async (id: string, decision: "APPROVED" | "REJECTED") => {
    const comment = window.prompt("Add a comment (optional)") || undefined;
    try {
      const res = await fetch(`/api/expenses/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ decision, comment }),
      });
      if (res.ok) {
        toast.success(decision === "APPROVED" ? "Expense approved" : "Expense rejected");
        loadExpenses();
      } else {
        toast.error("Action failed");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const pendingExpenses = expenses.filter(e => e.status === "PENDING");
  const approvedExpenses = expenses.filter(e => e.status === "APPROVED");
  const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.convertedAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-muted-foreground">Review and approve team expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          title="Pending Approvals"
          value={pendingExpenses.length}
          color="text-yellow-600"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          title="Approved This Month"
          value={approvedExpenses.length}
          color="text-green-600"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          title="Total Approved"
          value={`${company?.currency} ${Math.round(totalApproved)}`}
          color="text-blue-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and approve expenses from your team</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No pending approvals</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="font-medium">{expense.employeeId.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={expense.description}>
                      {expense.description}
                    </TableCell>
                    <TableCell className="font-medium">
                      {expense.convertedAmount} {expense.convertedCurrency}
                      {expense.currency !== expense.convertedCurrency && (
                        <span className="text-xs text-muted-foreground block">
                          ({expense.amount} {expense.currency})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{expense.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => decide(expense.id, "APPROVED")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => decide(expense.id, "REJECTED")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>All expenses from your team</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 10).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{expense.category}</TableCell>
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
